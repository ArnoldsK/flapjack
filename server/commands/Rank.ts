import { GuildMember, SlashCommandBuilder } from "discord.js"

import { Unicode } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { getRankImage } from "~/server/canvas/rankImage"
import {
  ExperienceModel,
  ExperienceRankData,
} from "~/server/db/model/Experience"
import { assert, checkUnreachable } from "~/server/utils/error"
import { makeEqualLengths } from "~/server/utils/string"

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
    .setDescription("Get user's rank")
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

  get isEphemeral(): boolean {
    return this.getSubcommand() === SubcommandName.Top
  }

  async execute() {
    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.Me: {
        await this.#handleMe()
        return
      }

      case SubcommandName.User: {
        await this.#handleUser()
        return
      }

      case SubcommandName.Top: {
        await this.#handleTop()
        return
      }

      default: {
        checkUnreachable(subcommand)
      }
    }
  }

  async #handleMe() {
    await this.#handleMember(this.member)
  }

  async #handleUser() {
    const user = this.interaction.options.getUser(OptionName.User, true)
    const member = this.guild.members.cache.get(user.id)

    assert(!!member, "User not found")

    await this.#handleMember(member)
  }

  async #handleMember(member: GuildMember) {
    const model = new ExperienceModel(this.context)
    const allRankData = await model.getAllRankData()
    const rankData = allRankData.find((el) => el.member.id === member.id)

    assert(!!rankData, "You don't have a rank yet")

    this.reply({
      files: [await getRankImage(rankData)],
    })
  }

  async #handleTop() {
    const model = new ExperienceModel(this.context)
    const allRankData = await model.getAllRankData()
    const allRankDataText = this.#allRankDataToText(allRankData)

    this.reply({
      files: [
        {
          name: "ranks.txt",
          attachment: Buffer.from(allRankDataText),
        },
      ],
    })
  }

  #allRankDataToText(allRankData: ExperienceRankData[]): string {
    const parts: Record<string, string[]> = {
      ranks: [],
      levels: [],
      names: [],
    }

    for (const { rank, levelData, member } of allRankData) {
      parts.ranks.push(`#${rank}`)
      parts.levels.push(`LVL ${levelData.lvl}`)
      parts.names.push(member.displayName)
    }

    return allRankData
      .map((_, i) =>
        [
          makeEqualLengths(parts.ranks)[i],
          makeEqualLengths(parts.levels)[i],
          parts.names[i],
        ].join(Unicode.middot),
      )
      .join("\n")
  }
}
