import { GuildMember, SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { checkUnreachable } from "../utils/error"
import { getMemberByJoinPosition } from "../utils/member"
import { getUserInfoImage } from "../canvas/userInfoImage"
import { ExperienceModel } from "../models/Experience"
import { getMemberRankImage } from "../canvas/memberRankImage"

enum SubcommandName {
  Me = "me",
  User = "user",
  Top = "top",
}

enum OptionName {
  User = "user",
}

export default class RankCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("rank")
    .setDescription("Get server experience rank")
    .addSubcommand((subcommand) =>
      subcommand.setName(SubcommandName.Me).setDescription("Get your rank"),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.User)
        .setDescription("Get other user rank")
        .addUserOption((option) =>
          option
            .setName(OptionName.User)
            .setDescription("Choose a user")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName(SubcommandName.Top).setDescription("Get rank top"),
    )

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.Me:
        await this.#handleUser(this.user.id)
        break

      case SubcommandName.User:
        const user = this.interaction.options.getUser(OptionName.User, true)
        await this.#handleUser(user.id)
        break

      case SubcommandName.Top:
        await this.#handleTop()
        break

      default:
        checkUnreachable(subcommand)
    }
  }

  async #handleUser(userId: string) {
    const member = this.guild.members.cache.get(userId)
    if (!member) {
      throw new Error("Member not found")
    }

    const model = new ExperienceModel(member)
    const allRankData = await model.getAllMemberRankData()

    const rankData = allRankData.find((data) => data.member.id === member.id)
    if (!rankData) {
      throw new Error("Not enough experience for a rank")
    }

    this.reply({
      files: [await getMemberRankImage(rankData)],
    })
  }

  async #handleTop() {
    this.reply({
      ephemeral: true,
      content: "Not yet implemented, sowwy",
    })
  }
}
