import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"

enum OptionName {
  User = "user",
}

export default class Avatar extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("See those pixels up close")
    .addUserOption((option) =>
      option
        .setName(OptionName.User)
        .setDescription("Ignore this to get your own avatar"),
    )

  async execute() {
    const user = this.interaction.options.getUser(OptionName.User) ?? this.user

    const avatarUrl = user.avatarURL({
      size: 2048,
    })

    try {
      if (!avatarUrl) {
        throw new Error("No avatar")
      }

      this.reply({
        files: [avatarUrl],
        ephemeral: true,
      })
    } catch (err) {
      this.fail((err as Error).message)
    }
  }
}
