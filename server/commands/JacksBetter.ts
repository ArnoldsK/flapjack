import {
  ActionRowBuilder,
  APIEmbed,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  InteractionReplyOptions,
  InteractionResponse,
  Message,
  SlashCommandBuilder,
} from "discord.js"

import { OPTION_DESCRIPTION_AMOUNT, Unicode } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { CacheKey } from "~/server/cache"
import { CreditsModel, Wallet } from "~/server/db/model/Credits"
import { isCasinoChannel } from "~/server/utils/channel"
import { formatCredits, parseCreditsAmount } from "~/server/utils/credits"
import { assert } from "~/server/utils/error"
import { JacksBetter, JbCard } from "~/server/utils/jacksbetter"
import { joinAsLines } from "~/server/utils/string"

enum OptionName {
  Amount = "amount",
}

enum Action {
  Card = "card",
  Draw = "draw",
}

export default class JacksBetterCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("jb")
    .setDescription("Play Jacks or Better video poker")
    .addStringOption((option) =>
      option
        .setName(OptionName.Amount)
        .setDescription(OPTION_DESCRIPTION_AMOUNT)
        .setRequired(true),
    )

  get isEphemeral(): boolean {
    return !isCasinoChannel(this.channel)
  }

  #_creditsModel: CreditsModel
  get #creditsModel() {
    if (!this.#_creditsModel) {
      this.#_creditsModel = new CreditsModel(this.context)
    }
    return this.#_creditsModel
  }

  #getRunningGameUrl(): string | undefined {
    const manager = this.context.cache.get(CacheKey.JacksBetter)

    return manager.get(this.user.id)
  }

  #updateCache(
    active: boolean,
    response: InteractionResponse | Message | null,
  ) {
    const manager = this.context.cache.get(CacheKey.JacksBetter)

    if (response && active) {
      const url = new URL(this.channel.url)
      url.pathname += `/${response.id}`
      manager.set(this.user.id, url.toString())
    } else {
      manager.uns(this.user.id)
    }
  }

  async execute() {
    const gameUrl = this.#getRunningGameUrl()
    assert(!gameUrl, `You already have a running game at ${gameUrl}`)

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
    const game = new JacksBetter()

    game.deal({ bet: amount })

    await this.#creditsModel.modifyCredits({
      userId: this.member.id,
      byAmount: -amount,
      isCasino: true,
    })

    const response = await this.reply(this.#getReply(game))

    this.#updateCache(true, response ?? null)

    if (!response) {
      await this.#handleRefund(game)
      return
    }

    // Begin the rabbit hole...
    await this.#handleAwaitResponse(response, game)
  }

  async #handleAwaitResponse(
    response: InteractionResponse | Message,
    game: JacksBetter,
  ) {
    try {
      const interaction = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        idle: 5 * 60_000, // 5 minutes
        filter: (i) => i.user.id === this.user.id,
      })

      await interaction.deferUpdate()

      const customId = this.#decodeCustomId(interaction.customId)

      // #############################################################################
      // Toggle card state
      // #############################################################################
      if (customId.action === Action.Card) {
        // Update card held state
        const card = game.cards.find((card) => card.id === customId.cardId)
        assert(!!card, "Card not found!")

        game.setCardHold(card.id, !card.isHeld)

        // Update response
        const nextResponse = await interaction.editReply(this.#getReply(game))

        this.#updateCache(true, nextResponse)

        // Continue the rabbit hole...
        await this.#handleAwaitResponse(nextResponse, game)
        return
      }

      // #############################################################################
      // Draw new cards and end the game
      // #############################################################################
      const state = game.draw()

      // Adjust credits
      const wallet = await this.#creditsModel.modifyCredits({
        userId: this.member.id,
        byAmount: state.winAmount,
        isCasino: true,
      })

      let outcome
      if (state.handName) {
        outcome = `${state.handName}, you won`
      } else {
        outcome = state.isWin ? "You won" : "You lost"
      }

      await interaction.editReply({
        embeds: [
          {
            color: this.member.displayColor,
            description: joinAsLines(
              `**${outcome} ${formatCredits(state.winAmount || game.bet)}**`,
              `You have ${formatCredits(wallet.credits)} now`,
            ),
            fields: [
              {
                name: "Your hand",
                value: this.#formatCards(game.cards, true),
              },
            ],
          },
        ],
        components: [],
      })

      this.#updateCache(false, null)
    } catch (error) {
      this.#updateCache(false, null)

      if ((error as Error).name === "[InteractionCollectorError]") {
        const wallet = await this.#creditsModel.getWallet(this.member.id)

        await this.reply(this.#getTimedOutReply(game, wallet))
      } else {
        await this.#handleRefund(game, error as Error)
      }
    }
  }

  #getTimedOutReply(
    game: JacksBetter,
    wallet: Wallet,
  ): InteractionReplyOptions {
    return {
      embeds: [
        {
          color: this.member.displayColor,
          description: joinAsLines(
            `**No action within 5 minutes, you lost ${formatCredits(
              game.bet,
            )}**`,
            `You have ${formatCredits(wallet.credits)} now`,
          ),
        },
      ],
      components: [],
    }
  }

  #getErrorReply(
    game: JacksBetter,
    wallet: Wallet,
    error?: Error,
  ): InteractionReplyOptions {
    return {
      embeds: [
        {
          color: this.member.displayColor,
          description: joinAsLines(
            `**An error has occurred, you get back ${formatCredits(game.bet)}**`,
            `You have ${formatCredits(wallet.credits)} now`,
          ),
          footer: error
            ? {
                text: error.message,
              }
            : undefined,
        },
      ],
      components: [],
    }
  }

  #getReply(game: JacksBetter): InteractionReplyOptions {
    return {
      embeds: [
        {
          color: this.member.displayColor,
          description: "Select cards to hold",
          footer: this.isEphemeral
            ? { text: "Dismissing message counts as a loss" }
            : undefined,
        },
      ],
      components: this.#getCardsComponents(game.cards),
    }
  }

  #getCardsComponents(cards: JbCard[]) {
    const cardsActionRow = new ActionRowBuilder<ButtonBuilder>()
    cardsActionRow.addComponents(
      ...cards.map((card) =>
        new ButtonBuilder()
          .setCustomId(this.#encodeCustomId(Action.Card, card.id))
          .setLabel(this.#formatCards([card]))
          .setStyle(card.isHeld ? ButtonStyle.Success : ButtonStyle.Secondary),
      ),
    )

    const drawActionRow = new ActionRowBuilder<ButtonBuilder>()
    drawActionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(this.#encodeCustomId(Action.Draw))
        .setLabel("Draw")
        .setStyle(ButtonStyle.Primary),
    )

    return [cardsActionRow, drawActionRow]
  }

  #encodeCustomId(action: Action.Card, cardId: string): string
  #encodeCustomId(action: Action.Draw, cardId?: undefined): string
  #encodeCustomId(action: Action, cardId?: string): string {
    return [action, cardId].filter(Boolean).join("::")
  }

  #decodeCustomId(customId: string):
    | {
        action: Action.Card
        cardId: string
      }
    | {
        action: Action.Draw
      } {
    const [action, cardId] = customId.split("::")

    return {
      action: action as Action,
      cardId: cardId as string,
    }
  }

  #formatCards(cards: JbCard[], showHeld?: boolean): string {
    return cards
      .map((card) => {
        const result = `${card.value}${Unicode[card.suit]}`

        return showHeld && card.isHeld ? `__${result}__` : result
      })
      .join(` ${Unicode.middot} `)
  }

  async #handleRefund(game: JacksBetter, error?: Error) {
    const wallet = await this.#creditsModel.modifyCredits({
      userId: this.user.id,
      byAmount: game.bet,
      isCasino: true,
    })

    const reply = this.#getErrorReply(game, wallet)
    const embed = reply.embeds!.at(0)! as APIEmbed

    if (error) {
      await this.reply(this.#getErrorReply(game, wallet, error))
    } else {
      throw new Error(embed.description ?? "Something went wrong!")
    }
  }
}
