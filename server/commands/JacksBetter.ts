import {
  AttachmentBuilder,
  ComponentType,
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
import { getJbCardsImage } from "~/server/canvas/jbCardsImage"
import { CreditsModel, Wallet } from "~/server/db/model/Credits"
import { isCasinoChannel } from "~/server/utils/channel"
import { formatCredits, parseCreditsAmount } from "~/server/utils/credits"
import { assert } from "~/server/utils/error"
import { JacksBetter, JbCard, JbDrawResult } from "~/server/utils/jacksbetter"
import { joinAsLines } from "~/server/utils/string"

enum OptionName {
  Amount = "amount",
}

const VALUE_NONE = "none"

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

    await this.#handleResponse(response, game)
  }

  async #handleResponse(response: Message, game: JacksBetter) {
    try {
      const interaction = await response.awaitMessageComponent({
        componentType: ComponentType.StringSelect,
        time: 5 * 60_000, // 5 minutes
        filter: (i) => i.user.id === this.user.id,
      })

      // Toggle card state
      for (const card of game.cards) {
        game.setCardHold(card.id, interaction.values.includes(card.id))
      }

      // Draw new cards and end the game
      const result = game.draw()

      // Adjust credits
      const wallet = await this.#creditsModel.modifyCredits({
        userId: this.member.id,
        byAmount: result.winAmount,
        isCasino: true,
      })

      // Convoluted reply fallback due to the interaction sometimes failing
      try {
        await interaction.update(this.#getDrawReply(result, wallet))
      } catch (error) {
        console.dir(
          { name: "JacksBetter error", interaction, error },
          { depth: null },
        )
        await this.reply(this.#getDrawReply(result, wallet, true))
      }

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

  #getDrawReply(
    result: JbDrawResult,
    wallet: Wallet,
    hasInteractionError?: boolean,
  ): InteractionEditReplyOptions {
    let outcome: string
    if (result.handName) {
      outcome = `${result.handName}, you won`
    } else {
      outcome = result.isWin ? "You won" : "You lost"
    }

    const amount = formatCredits(result.betAmount, {
      withTimes: result.winMulti,
    })

    return {
      files: [
        new AttachmentBuilder(
          getJbCardsImage({ cards: result.cards, small: true }),
          { name: "cards.png" },
        ),
      ],
      components: [
        new ContainerBuilder()
          .setAccentColor(this.member.displayColor)
          .addMediaGalleryComponents((mediaGallery) =>
            mediaGallery.addItems((mediaItem) =>
              mediaItem.setURL("attachment://cards.png"),
            ),
          )
          .addSeparatorComponents((separator) => separator)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              joinAsLines(
                `**${outcome} ${amount}**`,
                `You have ${formatCredits(wallet.credits)} now`,
                hasInteractionError
                  ? "-# There was an interaction error"
                  : null,
              ),
            ),
          ),
      ],
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

  #getDealReply(game: JacksBetter): InteractionEditReplyOptions {
    return {
      files: [
        new AttachmentBuilder(getJbCardsImage({ cards: game.cards }), {
          name: "cards.png",
        }),
      ],
      components: [
        new ContainerBuilder()
          .setAccentColor(this.member.displayColor)
          .addMediaGalleryComponents((mediaGallery) =>
            mediaGallery.addItems((mediaItem) =>
              mediaItem.setURL("attachment://cards.png"),
            ),
          )
          .addTextDisplayComponents(
            game.cardsHandName
              ? [
                  new TextDisplayBuilder().setContent(
                    `-# ${game.cardsHandName}`,
                  ),
                ]
              : [],
          )
          .addSeparatorComponents((separator) => separator)
          .addActionRowComponents((actionRow) =>
            actionRow.setComponents(
              new StringSelectMenuBuilder()
                .setCustomId("jb-held-cards")
                .setPlaceholder("Choose cards to hold")
                .setOptions([
                  ...game.cards.map((card) => ({
                    label: this.#formatCard(card),
                    value: card.id,
                    default: card.isHeld,
                  })),
                  {
                    label: "None",
                    value: VALUE_NONE,
                  },
                ])
                .setMinValues(1)
                .setMaxValues(5),
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
