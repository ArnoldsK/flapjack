import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  SlashCommandBuilder,
} from "discord.js"
import getColors from "get-image-colors"
import deltaE from "delta-e"

import { BaseCommand } from "../base/Command"
import { checkUnreachable } from "../utils/error"
import {
  getMemberColorRole,
  purgeRole,
  setMemberColorRole,
} from "../utils/role"
import {
  labArrayToObject,
  parseHexColor,
  setColorInteractionId,
} from "../utils/color"
import { getUserColorPreviewImage } from "../canvas/userAutoColorPreview"
import { DISCORD_BACKGROUND_COLOR_LAB } from "../constants"

enum SubcommandName {
  Suggest = "suggest",
  Custom = "custom",
  None = "none",
}

enum OptionName {
  Hex = "hex",
}

export class ColorCommand extends BaseCommand {
  static version = 3

  static command = new SlashCommandBuilder()
    .setName("color")
    .setDescription("Change your display color")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Suggest)
        .setDescription("Suggest colors based on your avatar"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Custom)
        .setDescription("Input your own hex color code")
        .addStringOption((option) =>
          option
            .setName(OptionName.Hex)
            .setDescription("Full length hex color, e.g. #B492D4")
            .setRequired(true)
            .setMinLength(6)
            .setMaxLength(7),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.None)
        .setDescription("Remove existing custom color"),
    )

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.Suggest:
        await this.#handleSuggest()
        return

      case SubcommandName.Custom:
        await this.#handleCustom()
        return

      case SubcommandName.None:
        await this.#handleNone()
        return

      default:
        checkUnreachable(subcommand)
    }
  }

  async #handleSuggest() {
    const avatarUrl = this.member.displayAvatarURL({
      forceStatic: true,
      extension: "png",
      size: 64,
    })

    const colors = await getColors(avatarUrl, {
      type: "image/png",
      count: 8,
    })

    const hexColors = colors
      .map((color) => ({
        hex: color.hex(),
        visibilityDelta: deltaE.getDeltaE94(
          labArrayToObject(color.lab()),
          labArrayToObject(DISCORD_BACKGROUND_COLOR_LAB),
        ),
      }))
      .filter((el) => {
        // Assumed value that is visible enough
        return el.visibilityDelta > 20
      })
      .sort((a, b) => b.visibilityDelta - a.visibilityDelta)
      .slice(0, 4)
      .map((el) => el.hex)

    if (!hexColors.length) {
      this.fail("Not enough colors with a good name visibility")
      return
    }

    const previewImage = await getUserColorPreviewImage({
      avatarUrl,
      hexColors,
      displayName: this.member.displayName,
    })

    const row = new ActionRowBuilder<ButtonBuilder>()
    row.addComponents(
      hexColors.map((hexColor, i) =>
        new ButtonBuilder()
          .setCustomId(setColorInteractionId.encode(hexColor))
          .setLabel(`#${i + 1}`)
          .setStyle(ButtonStyle.Primary),
      ),
    )

    this.reply({
      ephemeral: true,
      files: [previewImage],
      components: [row],
    })
  }

  async #handleCustom() {
    const input = this.interaction.options.getString(OptionName.Hex, true)
    const hex = parseHexColor(input)

    if (!hex) {
      this.fail("Not a valid hex color.")
      return
    }

    await setMemberColorRole(this.member, hex)

    this.reply({
      ephemeral: true,
      content: `Changed your color to ${hex}`,
    })
  }

  async #handleNone() {
    const role = getMemberColorRole(this.member)
    if (!role) return

    await this.member.roles.remove(role)
    await purgeRole(role)

    this.reply({
      ephemeral: true,
      content: "Color removed.",
    })
  }
}
