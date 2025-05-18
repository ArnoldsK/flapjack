import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "~/server/base/Command"

enum OptionName {
  User = "user",
  Spying = "spy",
}

export default class AvatarCommand extends BaseCommand {
  static version = 3

  static command = new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("See those pixels up close")
    .addUserOption((option) =>
      option
        .setName(OptionName.User)
        .setDescription("Ignore this to get your own avatar"),
    )
    .addBooleanOption((option) =>
      option
        .setName(OptionName.Spying)
        .setDescription("Only you will see the avatar, no one will know"),
    )

  async execute() {
    const user = this.interaction.options.getUser(OptionName.User) ?? this.user
    const spying = this.interaction.options.getBoolean(OptionName.Spying)

    const avatarUrl = user.avatarURL({
      size: 2048,
    })

    try {
      if (!avatarUrl) {
        throw new Error("No avatar")
      }

      this.reply({
        ephemeral: !!spying,
        files: [avatarUrl],
      })
    } catch (err) {
      this.fail((err as Error).message)
    }
  }
}
