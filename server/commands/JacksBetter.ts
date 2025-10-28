import {
  ButtonBuilder,
  ButtonStyle,
  ContainerBuilder,
  InteractionEditReplyOptions,
  InteractionResponse,
  Message,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
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

  get isComponentsV2(): boolean {
    return true
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

    const response = await this.reply(this.#getDealReply(game))

    this.#updateCache(true, response ?? null)

    if (!response) {
      await this.#handleRefund(game)
      return
    }

    // Begin the rabbit hole...
    await this.#handleResponse(response, game)
  }

  async #handleResponse(response: Message, game: JacksBetter) {
    try {
      const interaction = await response.awaitMessageComponent({
        time: 5 * 60_000, // 5 minutes
        filter: (i) => i.user.id === this.user.id,
      })

      // #############################################################################
      // Toggle card state
      // #############################################################################
      if (interaction.isStringSelectMenu()) {
        for (const card of game.cards) {
          game.setCardHold(card.id, interaction.values.includes(card.id))
        }

        await interaction.update(this.#getDealReply(game))

        // Continue the rabbit hole...
        await this.#handleResponse(response, game)
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

      let outcome: string
      if (state.handName) {
        outcome = `${state.handName}, you won`
      } else {
        outcome = state.isWin ? "You won" : "You lost"
      }

      const result = formatCredits(state.betAmount, {
        withTimes: state.winMulti,
      })

      await interaction.update({
        components: [
          new ContainerBuilder()
            .setAccentColor(this.member.displayColor)
            .addTextDisplayComponents((textDisplay) =>
              textDisplay.setContent(this.#formatCards(game.cards)),
            )
            .addSeparatorComponents((separator) => separator)
            .addTextDisplayComponents((textDisplay) =>
              textDisplay.setContent(
                joinAsLines(
                  `**${outcome} ${result}**`,
                  `You have ${formatCredits(wallet.credits)} now`,
                ),
              ),
            ),
        ],
      })

      this.#updateCache(false, null)
    } catch (error) {
      this.#updateCache(false, null)

      if ((error as Error).name.includes("InteractionCollectorError")) {
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
  ): InteractionEditReplyOptions {
    return {
      components: [
        new ContainerBuilder()
          .setAccentColor(this.member.displayColor)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              joinAsLines(
                `**No action within 5 minutes, you lost ${formatCredits(
                  game.bet,
                )}**`,
                `You have ${formatCredits(wallet.credits)} now`,
              ),
            ),
          ),
      ],
    }
  }

  #getErrorReply(
    game: JacksBetter,
    wallet: Wallet,
    error?: Error,
  ): InteractionEditReplyOptions {
    return {
      components: [
        new ContainerBuilder()
          .setAccentColor(this.member.displayColor)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              joinAsLines(
                `**An error has occurred, you get back ${formatCredits(game.bet)}**`,
                `You have ${formatCredits(wallet.credits)} now`,
                error ? `-# ${error.message}` : null,
              ),
            ),
          ),
      ],
    }
  }

  #getDealReply(game: JacksBetter): Omit<InteractionEditReplyOptions, "flags"> {
    return {
      components: [
        new ContainerBuilder()
          .setAccentColor(this.member.displayColor)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(this.#formatCards(game.cards)),
          )
          .addSeparatorComponents((separator) => separator)
          .addActionRowComponents((actionRow) =>
            actionRow.setComponents(
              new StringSelectMenuBuilder()
                .setCustomId("jb-held-cards")
                .setPlaceholder("Choose cards to hold")
                .setOptions(
                  game.cards.map((card) => ({
                    label: this.#formatCard(card),
                    value: card.id,
                    default: card.isHeld,
                  })),
                )
                .setRequired(false)
                .setMinValues(0)
                .setMaxValues(5),
            ),
          )
          .addActionRowComponents((actionRow) =>
            actionRow.setComponents(
              new ButtonBuilder()
                .setCustomId("jb-draw")
                .setLabel("Draw")
                .setStyle(ButtonStyle.Primary),
            ),
          )
          .addTextDisplayComponents(
            this.isEphemeral
              ? [
                  new TextDisplayBuilder().setContent(
                    "-# Dismissing message counts as a loss",
                  ),
                ]
              : [],
          ),
      ],
    }
  }

  #formatCard(card: JbCard, showHeld?: boolean): string {
    const result = `${card.value}${Unicode[card.suit]}`

    return showHeld && card.isHeld ? `__${result}__` : result
  }

  #formatCards(cards: JbCard[]): string {
    return cards
      .map((card) => this.#formatCard(card, true))
      .join(` ${Unicode.middot} `)
  }

  async #handleRefund(game: JacksBetter, error?: Error) {
    const wallet = await this.#creditsModel.modifyCredits({
      userId: this.user.id,
      byAmount: game.bet,
      isCasino: true,
    })

    if (error) {
      await this.reply(this.#getErrorReply(game, wallet, error))
    } else {
      throw new Error(
        joinAsLines(
          `**An error has occurred, you get back ${formatCredits(game.bet)}**`,
          `You have ${formatCredits(wallet.credits)} now`,
        ),
      )
    }
  }
}
