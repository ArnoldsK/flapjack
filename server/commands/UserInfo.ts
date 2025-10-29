import { GuildMember, SlashCommandBuilder } from "discord.js"

import { BaseCommand } from "~/server/base/Command"
import { getUserInfoImage } from "~/server/canvas/userInfoImage"
import { assert, checkUnreachable } from "~/server/utils/error"
import { getMemberByJoinPosition } from "~/server/utils/member"

enum SubcommandName {
  User = "user",
  Position = "position",
}

enum OptionName {
  User = "user",
  Position = "position",
}

export default class UserInfoCommand extends BaseCommand {
  static version = 3

  static command = new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get user's join information")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.User)
        .setDescription("Get your or other user information")
        .addUserOption((option) =>
          option.setName(OptionName.User).setDescription("Choose a user"),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Position)
        .setDescription("Find user by join position")
        .addIntegerOption((option) =>
          option
            .setName(OptionName.Position)
            .setDescription("The position of user joining the server")
            .setMinValue(1)
            .setRequired(true),
        ),
    )

  async execute() {
    const member = await this.#findMember()
    assert(!!member, "User not found")

    this.reply({
      files: [await getUserInfoImage(member)],
    })
  }

  async #findMember(): Promise<GuildMember | undefined | null> {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.User: {
        const user = this.interaction.options.getUser(OptionName.User)

        return this.guild.members.cache.get(user ? user.id : this.member.id)
      }

      case SubcommandName.Position: {
        const position = this.interaction.options.getInteger(
          OptionName.Position,
          true,
        )
        return getMemberByJoinPosition(this.guild, position)
      }

      default: {
        checkUnreachable(subcommand)
      }
    }
  }
}
