import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { checkUnreachable } from "../utils/error"
import {
  getMemberColorRole,
  purgeRole,
  setMemberColorRole,
} from "../utils/role"
import { getImageBestColorData, parseHexColor } from "../utils/color"

enum SubcommandName {
  Auto = "auto",
  Custom = "custom",
  None = "none",
}

enum OptionName {
  Hex = "hex",
}

export default class ColorCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("color")
    .setDescription("Change your display color")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Auto)
        .setDescription("Find the best color based on your avatar"),
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
            .setMinLength(7)
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
      case SubcommandName.Auto:
        await this.#handleAuto()
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

  async #handleAuto() {
    const avatarUrl = this.user.displayAvatarURL({
      forceStatic: true,
      extension: "png",
      size: 64,
    })

    const { colorHex } = await getImageBestColorData(avatarUrl)

    await setMemberColorRole(this.member, colorHex)

    this.reply({
      ephemeral: true,
      content: `Changed your color to ${colorHex}`,
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
