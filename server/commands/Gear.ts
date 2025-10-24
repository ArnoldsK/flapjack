import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
} from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { osrsItemIdByName } from "~/constants/osrs"
import { BaseCommand } from "~/server/base/Command"
import { CreditsModel } from "~/server/db/model/Credits"
import { OsrsItemSlotError, GearModel } from "~/server/db/model/Gear"
import { isCasinoChannel } from "~/server/utils/channel"
import { formatCredits } from "~/server/utils/credits"
import { assert, checkUnreachable } from "~/server/utils/error"
import { getPercentageChangeString } from "~/server/utils/number"
import { joinAsLines } from "~/server/utils/string"
import { GearSlot } from "~/types/osrs"

enum SubcommandName {
  View = "view",
  Buy = "buy",
  Sell = "sell",
}

enum OptionName {
  User = "user",
  Slot = "slot",
  Name = "name",
}

enum CustomId {
  Buy = "buy",
  Sell = "sell",
}

export default class GearCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("gear")
    .setDescription("Manage your gear")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.View)
        .setDescription("View your gear")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("View other user gear"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Buy)
        .setDescription("Buy new gear")
        .addStringOption((option) =>
          option
            .setName(OptionName.Slot)
            .setDescription("Select gear slot")
            .setChoices(
              ...Object.entries(GearSlot).map(([name, value]) => ({
                name,
                value,
              })),
            )
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName(OptionName.Name)
            .setDescription(
              "Find OSRS item by name. The item must be tradeable in the Grand Exchange.",
            )
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Sell)
        .setDescription("Sell your gear")
        .addStringOption((option) =>
          option
            .setName(OptionName.Slot)
            .setDescription("Select gear slot")
            .setChoices(
              ...Object.entries(GearSlot).map(([name, value]) => ({
                name,
                value,
              })),
            )
            .setRequired(true),
        ),
    )

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.View: {
        await this.#handleView()
        break
      }

      case SubcommandName.Buy: {
        await this.#handleBuy()
        break
      }

      case SubcommandName.Sell: {
        await this.#handleSell()
        break
      }

      default: {
        checkUnreachable(subcommand)
      }
    }
  }

  get isEphemeral(): boolean {
    return (
      !isCasinoChannel(this.channel) &&
      this.channel.id !== DISCORD_IDS.channels.runescape
    )
  }

  async #handleView() {
    const user = this.interaction.options.getUser(OptionName.User)
    const member = user ? this.guild.members.cache.get(user.id) : this.member
    assert(!!member, "Member not found")

    const model = new GearModel(this.context)
    const { items, thumbnail, files } = await model.getItemsWithEmbed(member)
    const priceByItemId = await model.getPriceByItemIdMap()

    this.reply({
      embeds: [
        {
          title: member.displayName,
          color: member.displayColor,
          description: items.length === 0 ? "No items" : undefined,
          fields:
            items.length > 0
              ? items.map((item) => {
                  const price = priceByItemId.get(item.itemId)
                  const change = getPercentageChangeString({
                    initial: Number(item.itemBoughtPrice),
                    current: Number(price ?? item.itemBoughtPrice),
                  })
                  const changeStr = change !== "0%" ? ` (${change})` : ""

                  return {
                    name: item.itemName,
                    value: `Bought for ${formatCredits(item.itemBoughtPrice)}${changeStr}`,
                    inline: true,
                  }
                })
              : undefined,
          thumbnail,
        },
      ],
      files,
    })
  }

  async #handleBuy() {
    const slot = this.interaction.options.getString(
      OptionName.Slot,
      true,
    ) as GearSlot
    const nameInput = this.interaction.options.getString(OptionName.Name, true)

    const itemsBySlot = osrsItemIdByName[slot]
    assert(itemsBySlot.size > 0, "Unknown slot")

    const name = [...itemsBySlot.keys()].find(
      (el) => el.toLowerCase() === nameInput.toLowerCase(),
    )
    const itemId = name ? itemsBySlot.get(name) : null
    assert(
      !!name && !!itemId,
      "Unknown OSRS item or it's not tradeable in the GE",
    )

    const gearModel = new GearModel(this.context)
    const priceByItemId = await gearModel.getPriceByItemIdMap()

    const price = priceByItemId.get(itemId)
    assert(!!price, "Item was found but it seems to not be tradeable in the GE")

    const items = await gearModel.getItems(this.member.id)

    const creditsModel = new CreditsModel(this.context)
    const wallet = await creditsModel.getWallet(this.member.id)

    const canAfford = price <= wallet.credits
    const slotError = gearModel.getSlotError({
      slot,
      items,
    })

    const canBuy = canAfford && !slotError

    const response = await this.reply({
      embeds: [
        {
          color: this.member.displayColor,
          title: name,
          description: joinAsLines(
            `**${formatCredits(price)}**`,
            !canAfford
              ? `You lack ${formatCredits(BigInt(price) - wallet.credits)}`
              : undefined,
          ),
          footer: canAfford && slotError ? { text: slotError } : undefined,
          thumbnail: {
            url: `https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${itemId}`,
          },
        },
      ],
      components: canBuy ? this.#getBuyComponents() : undefined,
    })

    if (!canBuy || !response) return

    try {
      const interaction = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 60_000, // 1 minute
        filter: (i) => i.user.id === this.user.id,
      })

      await interaction.deferUpdate()

      // Handle separately to catch error
      await gearModel.addItem({
        userId: this.member.id,
        itemId,
        itemName: name,
        itemBoughtPrice: BigInt(price),
        itemSlot: slot,
      })

      await Promise.all([
        interaction.editReply({
          components: this.#getBuyComponents({
            success: true,
          }),
        }),
        creditsModel.modifyCredits({
          userId: this.member.id,
          byAmount: -price,
          isCasino: false,
        }),
      ])
    } catch (error) {
      if (error instanceof OsrsItemSlotError) {
        await this.reply({
          content: error.message,
          embeds: [],
          components: [],
        })
      } else {
        await this.reply({
          components: [],
        })
      }
    }
  }

  #getBuyComponents(options?: { success?: boolean }) {
    const actionRow = new ActionRowBuilder<ButtonBuilder>()

    const button = new ButtonBuilder()
      .setCustomId(CustomId.Buy)
      .setLabel("Buy")
      .setStyle(ButtonStyle.Primary)

    if (options?.success) {
      button
        .setLabel("Bought")
        .setEmoji("🎉")
        .setStyle(ButtonStyle.Success)
        .setDisabled(true)
    }

    actionRow.addComponents(button)

    return [actionRow]
  }

  async #handleSell() {
    const slot = this.interaction.options.getString(
      OptionName.Slot,
      true,
    ) as GearSlot

    const gearModel = new GearModel(this.context)
    const items = await gearModel.getItems(this.member.id)

    const item = items.find((item) => item.itemSlot === slot)
    assert(!!item, "Item not found or you don't own any")

    const priceByItemId = await gearModel.getPriceByItemIdMap()
    // Sell for the bought price as a fallback
    const realPrice = priceByItemId.get(item.itemId)
    const price = realPrice ?? item.itemBoughtPrice

    const response = await this.reply({
      embeds: [
        {
          color: this.member.displayColor,
          title: item.itemName,
          description: `**${formatCredits(price)}**`,
          footer: !realPrice
            ? { text: `Real price not found, using purchase price` }
            : undefined,
          thumbnail: {
            url: `https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${item.itemId}`,
          },
        },
      ],
      components: this.#getSellComponents(),
    })

    if (!response) return

    try {
      const interaction = await response.awaitMessageComponent({
        componentType: ComponentType.Button,
        time: 60_000, // 1 minute
        filter: (i) => i.user.id === this.user.id,
      })

      await interaction.deferUpdate()

      const creditsModel = new CreditsModel(this.context)

      await Promise.all([
        interaction.editReply({
          components: this.#getSellComponents({
            success: true,
          }),
        }),
        gearModel.removeItem({
          userId: this.member.id,
          itemId: item.itemId,
        }),
        creditsModel.modifyCredits({
          userId: this.member.id,
          byAmount: price,
          isCasino: false,
        }),
      ])
    } catch {
      await this.reply({
        components: [],
      })
    }
  }

  #getSellComponents(options?: { success?: boolean }) {
    const actionRow = new ActionRowBuilder<ButtonBuilder>()

    const button = new ButtonBuilder()
      .setCustomId(CustomId.Sell)
      .setLabel("Sell")
      .setStyle(ButtonStyle.Danger)

    if (options?.success) {
      button
        .setLabel("Sold")
        .setEmoji("🎉")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    }

    actionRow.addComponents(button)

    return [actionRow]
  }
}
