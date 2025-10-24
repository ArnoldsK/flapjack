import { SlashCommandBuilder } from "discord.js"

import { BaseCommand } from "~/server/base/Command"
import { assert } from "~/server/utils/error"

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

  get isEphemeral(): boolean {
    return !!this.interaction.options.getBoolean(OptionName.Spying)
  }

  async execute() {
    const user = this.interaction.options.getUser(OptionName.User) ?? this.user

    const avatarUrl = user.avatarURL({
      size: 2048,
    })

    try {
      assert(!!avatarUrl, "User has no avatar")

      this.reply({
        files: [avatarUrl],
      })
    } catch (error) {
      this.fail((error as Error).message)
    }
  }
}
