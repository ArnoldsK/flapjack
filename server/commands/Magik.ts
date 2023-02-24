import { SlashCommandBuilder } from "discord.js"
import { isUrl } from "../helpers/web"
import { BaseCommand } from "../base/Command"

const API_URL = "https://arnoldsk.lv/liquify-api/?url="

const SUBCOMMAND_USER = "user"
const SUBCOMMAND_URL = "url"

const OPTION_USER = "user"
const OPTION_URL = "url"

export class Magik extends BaseCommand {
  static command = new SlashCommandBuilder()
    .setName("magik")
    .setDescription("Liquify an image")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SUBCOMMAND_USER)
        .setDescription("Liquify user avatar")
        .addUserOption((option) =>
          option
            .setName(OPTION_USER)
            .setDescription("Which user avatar to liquify?")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SUBCOMMAND_URL)
        .setDescription("Liquify an image by URL")
        .addStringOption((option) =>
          option
            .setName(OPTION_URL)
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
      await this.reply({
        files: [
          {
            name: "magik.png",
            attachment: `${API_URL}${imageUrl}`,
          },
        ],
      })

      this.success()
    } catch (err) {
      this.fail((err as Error).message)
    }
  }

  getImageUrl(): string | null {
    const subcommand = this.interaction.options.getSubcommand(true)

    if (subcommand === SUBCOMMAND_USER) {
      const user = this.interaction.options.getUser(OPTION_USER) ?? this.user

      return user.avatarURL({
        forceStatic: true,
        extension: "png",
        size: 1024,
      })
    } else if (subcommand === SUBCOMMAND_URL) {
      return this.interaction.options.getString(OPTION_URL)
    } else {
      return null
    }
  }
}
