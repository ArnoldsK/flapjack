import { SlashCommandBuilder } from "discord.js"
import { isUrl } from "../utils/web"
import { BaseCommand } from "../base/Command"
import { checkUnreachable } from "../utils/error"

const API_URL = "https://arnoldsk.lv/liquify-api/?url="

enum SubcommandName {
  User = "user",
  Url = "url",
}

enum OptionName {
  User = "user",
  Url = "url",
}

export default class MagikCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("magik")
    .setDescription("Liquify an image")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.User)
        .setDescription("Liquify user avatar")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("Which user avatar to liquify?")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Url)
        .setDescription("Liquify an image by URL")
        .addStringOption((option) =>
          option
            .setName(OptionName.Url)
            .setDescription("Image URL for liquify")
            .setRequired(true),
        ),
    )

  async execute() {
    const imageUrl = this.getImageUrl()

    // Just to be safe, verify that the image is an URL
    if (!imageUrl || !isUrl(imageUrl)) {
      this.fail("This image URL is wack")
      return
    }

    try {
      // Attempt to send the image as an attachment
      this.reply({
        files: [
          {
            name: "magik.png",
            attachment: `${API_URL}${encodeURIComponent(imageUrl)}`,
          },
        ],
      })
    } catch (err) {
      this.fail((err as Error).message)
    }
  }

  getImageUrl(): string | null {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.User: {
        const user =
          this.interaction.options.getUser(OptionName.User) ?? this.user

        return user.avatarURL({
          forceStatic: true,
          extension: "png",
          size: 1024,
        })
      }

      case SubcommandName.Url:
        return this.interaction.options.getString(OptionName.Url, true).trim()

      default:
        checkUnreachable(subcommand)
        return null
    }
  }
}
