import {
  ActionRowBuilder,
  APIEmbed,
  APISelectMenuOption,
  ButtonBuilder,
  ButtonStyle,
  InteractionReplyOptions,
  InteractionResponse,
  LabelBuilder,
  Message,
  ModalBuilder,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  ButtonInteraction,
  ModalSubmitInteraction,
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
  Cards = "jb-cards",
  Draw = "jb-draw",
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

    const response = await this.reply(this.#getDealReply(game))

    this.#updateCache(true, response ?? null)

    if (!response) {
      await this.#handleRefund(game)
      return
    }

    // This is so... dumb
    this.client.on("interactionCreate", async (interaction) => {
      if (interaction.user.id !== this.user.id) return

      try {
        if (
          interaction.isButton() &&
          Object.values(Action).includes(interaction.customId as Action)
        ) {
          switch (interaction.customId as Action) {
            case Action.Cards: {
              await interaction.showModal(this.#getCardsModal(game), {
                withResponse: true,
              })
              break
            }
            case Action.Draw: {
              this.#handleDrawAction(game, interaction)
              break
            }
          }
        }

        if (
          interaction.isModalSubmit() &&
          interaction.isFromMessage() &&
          interaction.customId === `jb-modal-${game.id}`
        ) {
          await this.#handleModalSubmit(game, interaction)
        }
      } catch (error) {
        this.#updateCache(false, null)

        console.log("EVENT ERROR", error)

        if ((error as Error).name === "[InteractionCollectorError]") {
          const wallet = await this.#creditsModel.getWallet(this.member.id)

          await this.reply(this.#getTimedOutReply(game, wallet))
        } else {
          await this.#handleRefund(game, error as Error)
        }
      }
    })
  }

  async #handleModalSubmit(
    game: JacksBetter,
    interaction: ModalSubmitInteraction,
  ) {
    if (!interaction.deferred) {
      await interaction.deferUpdate()
    }

    const holdCardIds =
      interaction.fields.getStringSelectValues("hold-card-ids")

    for (const card of game.cards) {
      game.setCardHold(card.id, holdCardIds.includes(card.id))
    }

    const nextResponse = await interaction.editReply(this.#getDealReply(game))

    this.#updateCache(true, nextResponse)
  }

  async #handleDrawAction(game: JacksBetter, interaction: ButtonInteraction) {
    if (!interaction.deferred) {
      await interaction.deferUpdate()
    }

    const state = game.draw()

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
              value: this.#formatCards(game.cards),
            },
          ],
        },
      ],
      components: [],
    })

    this.#updateCache(false, null)
  }

  #getCardsModal(game: JacksBetter) {
    const modal = new ModalBuilder()
      .setCustomId(`jb-modal-${game.id}`)
      .setTitle("Jacks or Better")

    const cardsLabel = new LabelBuilder()
      .setLabel("Choose cards to hold")
      .setStringSelectMenuComponent(
        new StringSelectMenuBuilder()
          .setCustomId("hold-card-ids")
          .setOptions(
            ...game.cards.map(
              (card) =>
                ({
                  label: this.#formatCard(card),
                  value: card.id,
                  default: card.isHeld,
                }) satisfies APISelectMenuOption,
            ),
          )
          .setRequired(false)
          .setMinValues(0)
          .setMaxValues(5),
      )

    modal.addLabelComponents(cardsLabel)

    return modal
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

  #getDealReply(game: JacksBetter): Omit<InteractionReplyOptions, "flags"> {
    const actionRow = new ActionRowBuilder<ButtonBuilder>()
    actionRow.addComponents(
      new ButtonBuilder()
        .setCustomId(Action.Cards)
        .setLabel("Cards")
        .setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(Action.Draw)
        .setLabel("Draw")
        .setStyle(ButtonStyle.Success),
    )

    return {
      embeds: [
        {
          color: this.member.displayColor,
          fields: [
            {
              name: "Your hand",
              value: this.#formatCards(game.cards),
            },
          ],
          footer: this.isEphemeral
            ? { text: "Dismissing message counts as a loss" }
            : undefined,
        },
      ],
      components: [actionRow],
    }
  }

  #formatCard(card: JbCard, isHeld?: boolean): string {
    const result = `${card.value}${Unicode[card.suit]}`

    return isHeld ? `__**${result}**__` : result
  }

  #formatCards(cards: JbCard[]): string {
    return cards
      .map((card) => this.#formatCard(card, card.isHeld))
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
