import assert from "node:assert"

import {
  APIEmbed,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  InteractionResponse,
  Message,
  SlashCommandBuilder,
} from "discord.js"
import {
  Game,
  actions,
  Card,
  Hand,
  HandInfo,
  HandValue,
} from "engine-blackjack-ts"

import { OPTION_DESCRIPTION_AMOUNT, Unicode } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { CacheKey } from "~/server/cache"
import { CreditsModel } from "~/server/db/model/Credits"
import { isNonNullish } from "~/server/utils/boolean"
import { isCasinoChannel } from "~/server/utils/channel"
import { formatCredits, parseCreditsAmount } from "~/server/utils/credits"
import { joinAsLines, ucFirst } from "~/server/utils/string"

type Action = keyof typeof actions
type HandSide = keyof HandInfo
type ActionRow = ActionRowBuilder<ButtonBuilder>

interface ParseGameOptions {
  canDouble: boolean
}

interface ParsedGame {
  embed: Omit<APIEmbed, "description">
  components: ActionRow[]
  gameOver: boolean
  wonAmount: number
}

interface ParsedGameHands {
  currentHandSide: HandSide
  rightHand: Hand
  leftHand: Hand | undefined
  actionRow: ActionRow | undefined
}

enum OptionName {
  Amount = "amount",
}

export default class BlackjackCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("bj")
    .setDescription("Get as close to 21 as possible")
    .addStringOption((option) =>
      option
        .setName(OptionName.Amount)
        .setDescription(OPTION_DESCRIPTION_AMOUNT)
        .setRequired(true),
    )

  #_creditsModel: CreditsModel
  get #creditsModel() {
    if (!this.#_creditsModel) {
      this.#_creditsModel = new CreditsModel(this.context)
    }
    return this.#_creditsModel
  }

  #getRunningGameUrl(): string | undefined {
    const manager = this.context.cache.get(CacheKey.Blackjack)

    return manager.get(this.user.id)
  }

  #updateCache(game: Game, response: InteractionResponse | Message | null) {
    const manager = this.context.cache.get(CacheKey.Blackjack)

    if (response && game.getState().stage !== "done") {
      const url = new URL(this.channel.url)
      url.pathname += `/${response.id}`
      manager.set(this.user.id, url.toString())
    } else {
      manager.uns(this.user.id)
    }
  }

  async execute() {
    const gameUrl = this.#getRunningGameUrl()
    if (gameUrl) {
      this.fail(`You already have a running game at ${gameUrl}`)
      return
    }

    // #############################################################################
    // Prepare credits
    // #############################################################################
    const wallet = await this.#creditsModel.getWallet(this.member.id)

    const rawAmount = this.interaction.options.getString(
      OptionName.Amount,
      true,
    )
    const amount = parseCreditsAmount(rawAmount, wallet.credits)

    // #############################################################################
    // Handle the game
    // #############################################################################
    const game = this.#getNewGame()

    game.dispatch(actions.deal({ bet: amount }))

    const newWallet = await this.#creditsModel.addCredits(
      this.member.id,
      -amount,
    )
    const canDouble = newWallet.credits >= amount

    const { embed, components, gameOver, wonAmount } = this.#parseGame(game, {
      canDouble,
    })

    const description = gameOver
      ? await this.#handleGameOver(game, wonAmount)
      : undefined

    const ephemeral = !isCasinoChannel(this.channel)
    const response = await this.reply({
      ephemeral,
      embeds: [
        {
          ...embed,
          description,
          footer:
            ephemeral && !gameOver
              ? {
                  text: "Dismissing message counts as a loss",
                }
              : undefined,
        },
      ],
      components,
    })

    this.#updateCache(game, response ?? null)

    if (response && !gameOver) {
      // Begin the rabbit hole...
      await this.#handleAwaitResponse(response, game)
    }
  }

  async #handleAwaitResponse(
    response: InteractionResponse | Message,
    game: Game,
  ) {
    try {
      const interaction = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        idle: 60_000,
        filter: (i) => i.user.id === this.user.id,
      })

      await interaction.deferUpdate()

      // #############################################################################
      // Handle actions
      // #############################################################################
      const { action, handSide } = this.#decodeCustomAction(
        interaction.customId,
      )

      switch (action) {
        case "stand": {
          game.dispatch(actions.stand({ position: handSide }))
          break
        }
        case "hit": {
          game.dispatch(actions.hit({ position: handSide }))
          break
        }
        case "surrender": {
          game.dispatch(actions.surrender())
          break
        }
        case "double": {
          game.dispatch(actions.double({ position: handSide }))
          break
        }
        case "split": {
          game.dispatch(actions.split())
          break
        }
        default: {
          console.log("ACTION NOT IMPLEMENTED", action)
          break
        }
      }

      const state = game.getState()

      // #############################################################################
      // Modify credits
      // #############################################################################
      if (["double", "split"].includes(action)) {
        await this.#creditsModel.addCredits(this.member.id, -state.initialBet)
      }

      // #############################################################################
      // Update the message and repeat
      // #############################################################################
      const { embed, components, gameOver, wonAmount } = this.#parseGame(game, {
        canDouble: false,
      })

      const description = gameOver
        ? await this.#handleGameOver(game, wonAmount)
        : undefined

      const nextResponse = await interaction.editReply({
        embeds: [
          {
            ...embed,
            description,
          },
        ],
        components,
      })

      this.#updateCache(game, nextResponse)

      if (!gameOver) {
        // Continue the rabbit hole...
        await this.#handleAwaitResponse(nextResponse, game)
      }
    } catch {
      const wallet = await this.#creditsModel.getWallet(this.member.id)
      const state = game.getState()
      const lostAmount = state.finalBet || state.initialBet

      await this.editReply({
        embeds: [
          {
            color: this.member.displayColor,
            description: joinAsLines(
              `**No action within 1 minute, you lost ${formatCredits(
                lostAmount,
              )}**`,
              `You have ${formatCredits(wallet.credits)} now`,
            ),
          },
        ],
        components: [],
      })

      this.#updateCache(game, null)
    }
  }

  async #handleGameOver(game: Game, wonAmount: number): Promise<string> {
    const wallet = await this.#creditsModel.addCredits(
      this.member.id,
      wonAmount,
    )
    const state = game.getState()

    const rightHand = state.handInfo.right
    const leftHand = state.handInfo.left as Hand | undefined

    const bust: boolean =
      rightHand.playerHasBusted || !!leftHand?.playerHasBusted
    const hasDoubleBj: boolean =
      rightHand.playerHasBlackjack && !!leftHand?.playerHasBlackjack
    const hasBj: boolean =
      rightHand.playerHasBlackjack || !!leftHand?.playerHasBlackjack

    let outcome = "Game over"
    if (bust) {
      outcome = "Bust"
    } else if (state.dealerHasBusted) {
      outcome = "Dealer bust"
    } else if (state.dealerHasBlackjack) {
      outcome = "Dealer blackjack"
    } else if (hasDoubleBj) {
      outcome = "Double blackjack"
    } else if (hasBj) {
      outcome = "Blackjack"
    }

    const result = wonAmount
      ? `won ${formatCredits(wonAmount)}`
      : `lost ${formatCredits(state.finalBet || state.initialBet)}`

    return joinAsLines(
      `**${outcome}, you ${result}**`,
      `You have ${formatCredits(wallet.credits)} now`,
    )
  }

  #parseGame(game: Game, options: ParseGameOptions): ParsedGame {
    const state = game.getState()

    const { currentHandSide, rightHand, leftHand, actionRow } =
      this.#parseGameHands(game, options)

    const dealerHasHole = state.dealerCards.length === 1
    const gameOver = state.stage === "done"
    const wonAmount = state.wonOnLeft + state.wonOnRight

    return {
      embed: {
        color: this.member.displayColor,
        fields: [
          {
            inline: true,
            name: leftHand
              ? this.#formatActiveHand(
                  "Right hand",
                  !gameOver && currentHandSide === "right",
                )
              : this.#formatActiveHand("Your hand", !gameOver && true),
            value: joinAsLines(
              this.#formatCards(rightHand.cards),
              `Value: ${this.#formatHandValue(rightHand.playerValue)}`,
            ),
          },
          leftHand && {
            inline: true,
            name: this.#formatActiveHand(
              "Left hand",
              !gameOver && currentHandSide === "left",
            ),
            value: joinAsLines(
              this.#formatCards(leftHand.cards),
              `Value: ${this.#formatHandValue(leftHand.playerValue)}`,
            ),
          },
          {
            inline: !leftHand,
            name: "Dealer hand",
            value: joinAsLines(
              this.#formatCards(state.dealerCards, dealerHasHole),
              `Value: ${this.#formatHandValue(
                state.dealerValue,
                dealerHasHole,
              )}`,
            ),
          },
        ].filter(isNonNullish),
      },
      components: [actionRow].filter(isNonNullish),
      gameOver,
      wonAmount,
    }
  }

  #formatActiveHand(value: string, active: boolean): string {
    return active ? `__${value}__` : value
  }

  #parseGameHands(game: Game, options: ParseGameOptions): ParsedGameHands {
    const state = game.getState()
    const isPlayerTurn = ["player-turn-right", "player-turn-left"].includes(
      state.stage,
    )

    let currentHandSide: HandSide = "right"
    if (state.stage === "player-turn-left") {
      currentHandSide = "left"
    }

    const rightHand = state.handInfo["right"]
    const _leftHand = state.handInfo["left"]
    const leftHand: Hand | undefined = _leftHand.cards ? _leftHand : undefined

    const currentHand = currentHandSide === "right" ? rightHand : leftHand
    assert.ok(!!currentHand)

    const actions: Action[] = []
    for (const [action, available] of Object.entries(
      currentHand.availableActions,
    )) {
      if (["double", "split"].includes(action) && !options.canDouble) continue

      if (available) {
        actions.push(action as Action)
      }
    }

    let actionRow: ParsedGameHands["actionRow"]
    if (isPlayerTurn && actions.length > 0) {
      actionRow = new ActionRowBuilder<ButtonBuilder>()
      actionRow.addComponents(
        ...actions.map((action) =>
          new ButtonBuilder()
            .setCustomId(this.#encodeCustomId(action, currentHandSide))
            .setLabel(ucFirst(action))
            .setStyle(ButtonStyle.Secondary),
        ),
      )
    }

    return {
      currentHandSide,
      rightHand,
      leftHand,
      actionRow,
    }
  }

  #encodeCustomId(action: Action, handSide: HandSide) {
    return [action, handSide].join("::")
  }

  #decodeCustomAction(customId: string) {
    const [action, handSide] = customId.split("::")

    return {
      action: action as Action,
      handSide: handSide as HandSide,
    }
  }

  #formatCards(cards: Card[], dealerHasHole = false): string {
    const suiteEmoji: Record<Card["suite"], string> = {
      clubs: "♧",
      diamonds: "♢",
      hearts: "♡",
      spades: "♤",
    }

    const result = cards.map((card) => `${card.text}${suiteEmoji[card.suite]}`)
    if (dealerHasHole) {
      result.push("?")
    }

    return result.join(` ${Unicode.middot} `)
  }

  #formatHandValue(value: HandValue, dealerHasHole = false): string {
    const { lo, hi } = value

    let result = hi === lo ? `${hi}` : `${lo}/${hi}`
    if (dealerHasHole) {
      result += "?"
    }

    return result
  }

  #getNewGame() {
    return new Game(undefined, {
      // Why is this so retarded - why do I need to define all to change few?
      decks: 2,
      standOnSoft17: true,
      double: "any",
      split: true,
      doubleAfterSplit: true,
      surrender: true,
      insurance: false,
      showdownAfterAceSplit: true,
    })
  }
}
