import {
  ComponentType,
  ContainerBuilder,
  InteractionEditReplyOptions,
  Message,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextDisplayBuilder,
} from "discord.js"

import { OPTION_DESCRIPTION_AMOUNT, Unicode } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { CacheKey } from "~/server/cache"
import { getCardsAttachment } from "~/server/canvas/cardsAttachment"
import { CreditsModel, Wallet } from "~/server/db/model/Credits"
import { isCasinoChannel } from "~/server/utils/channel"
import { formatCredits, parseCreditsAmount } from "~/server/utils/credits"
import { assert, isInteractionCollectorError } from "~/server/utils/error"
import { JacksBetter, JbCard, JbDrawResult } from "~/server/utils/jacksbetter"
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

  async execute() {
    const cache = this.context.cache.get(CacheKey.GamesRunning)
    assert(
      !cache.get("jacksbetter"),
      "You already have a running Jacks or Better game",
    )

    cache.set("jacksbetter", true)

    const game = new JacksBetter()

    try {
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

      game.deal({ bet: amount })

      await this.#creditsModel.modifyCredits({
        userId: this.member.id,
        byAmount: -amount,
        isCasino: true,
      })

      const response = await this.reply(this.#getDealReply(game))

      assert(!!response, "No response")

      await this.#handleResponse(response, game)
    } catch (error) {
      if (isInteractionCollectorError(error)) {
        const wallet = await this.#creditsModel.getWallet(this.member.id)

        await this.reply(this.#getTimedOutReply(game, wallet))
      } else {
        await this.#handleRefund(game, error as Error)
      }
    } finally {
      cache.uns("jacksbetter")
    }
  }

  async #handleResponse(response: Message, game: JacksBetter) {
    const stringSelectMenuInteraction = await response.awaitMessageComponent({
      componentType: ComponentType.StringSelect,
      time: 5 * 60_000, // 5 minutes
      filter: (i) => i.user.id === this.user.id,
    })

    // Toggle card state
    for (const card of game.cards) {
      game.setCardHold(
        card.id,
        stringSelectMenuInteraction.values.includes(card.id),
      )
    }

    // Draw new cards and end the game
    const result = game.draw()

    // Adjust credits
    const wallet = await this.#creditsModel.modifyCredits({
      userId: this.member.id,
      byAmount: result.winAmount,
      isCasino: true,
    })

    await this.reply(this.#getDrawReply(result, wallet))
  }

  #getDrawReply(
    result: JbDrawResult,
    wallet: Wallet,
  ): InteractionEditReplyOptions {
    const attachment = getCardsAttachment({ cards: result.cards, small: true })

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
      files: [attachment],
      components: [
        new ContainerBuilder()
          .setAccentColor(this.member.displayColor)
          .addMediaGalleryComponents((mediaGallery) =>
            mediaGallery.addItems((mediaItem) =>
              mediaItem.setURL(`attachment://${attachment.name}`),
            ),
          )
          .addSeparatorComponents((separator) => separator)
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              joinAsLines(
                `**${outcome} ${amount}**`,
                `You have ${formatCredits(wallet.credits)} now`,
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
    const attachment = getCardsAttachment({ cards: game.cards })

    return {
      files: [attachment],
      components: [
        new ContainerBuilder()
          .setAccentColor(this.member.displayColor)
          .addMediaGalleryComponents((mediaGallery) =>
            mediaGallery.addItems((mediaItem) =>
              mediaItem.setURL(`attachment://${attachment.name}`),
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
                    value: "none",
                  },
                  // This is a hack to remedy the annoying Discord UI/UX
                  {
                    label: "Hold",
                    value: "placeholder",
                    // Set as always selected so the select doesn't jump on value change
                    default: true,
                  },
                ])
                .setMinValues(1)
                .setMaxValues(game.cards.length + 1),
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
