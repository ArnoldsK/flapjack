import { GuildMember, SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { checkUnreachable } from "../utils/error"
import { getMemberByJoinPosition } from "../utils/member"
import { getUserInfoImage } from "../canvas/userInfoImage"

enum SubcommandName {
  Me = "me",
  User = "user",
  Position = "position",
}

enum OptionName {
  User = "user",
  Position = "position",
}

export default class UserInfoCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Get user's join information")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Me)
        .setDescription("Get your information"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.User)
        .setDescription("Get other user information")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("Choose a user")
            .setRequired(true),
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

    if (!member) {
      this.fail("User not found")
      return
    }

    this.reply({
      files: [await getUserInfoImage(member)],
    })
  }

  async #findMember(): Promise<GuildMember | undefined | null> {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.Me:
        return this.member

      case SubcommandName.User:
        return this.guild.members.cache.get(
          this.interaction.options.getUser(OptionName.User, true).id,
        )

      case SubcommandName.Position: {
        const position = this.interaction.options.getInteger(
          OptionName.Position,
          true,
        )
        return getMemberByJoinPosition(this.guild, position)
      }

      default:
        checkUnreachable(subcommand)
    }
  }
}
