import hiscores from "osrs-json-hiscores"

import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { checkUnreachable } from "../utils/error"
import { RsLeagueModel } from "../models/RsLeague"
import { Unicode } from "../constants"
import { discordIds } from "../config"

enum SubcommandName {
  Set = "set",
  Ranks = "ranks",
}

enum OptionName {
  Name = "name",
}

export class RsLeagueCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("rs-league")
    .setDescription("OSRS seasonal league rankings between members")
    .addSubcommand((subcommand) =>
      subcommand
        .setName(SubcommandName.Set)
        .setDescription("Set your seasonal league name")
        .addStringOption((option) =>
          option
            .setName(OptionName.Name)
            .setDescription("Hiscores name")
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName(SubcommandName.Ranks).setDescription("Get rankings"),
    )

  async execute() {
    if (this.channel.id !== discordIds.channels.runescape) {
      this.fail("Not allowed in this channel")
      return
    }

    const subcommand = this.getSubcommand<SubcommandName>()

    switch (subcommand) {
      case SubcommandName.Set:
        await this.#handleSet()
        break

      case SubcommandName.Ranks:
        await this.#handleRanks()
        break

      default:
        checkUnreachable(subcommand)
    }
  }

  async #handleSet() {
    const name = this.interaction.options.getString(OptionName.Name, true)
    const model = new RsLeagueModel(this.member)

    try {
      await model.setName(name)
      this.success()
    } catch {
      this.fail()
    }
  }

  async #handleRanks() {
    // ! Defer
    await this.interaction.deferReply()

    const model = new RsLeagueModel(this.member)
    const entities = await model.getAll()

    let players = entities.map((entity) => ({
      ...entity,
      rank: 0,
      score: 0,
    }))

    // Intentionally not using Promise.all
    for (const [i, player] of players.entries()) {
      try {
        const stats = await hiscores.getStatsByGamemode(player.name, "seasonal")
        const { rank, score } = stats.leaguePoints
        // ! Mutate player numbers
        players[i].rank = rank
        players[i].score = score
      } catch {
        // Remove on fail
        await model.removeByUserId(player.member.id)
      }
    }

    // Remove no rank players
    players = players.filter((player) => !!player.rank)

    if (!players.length) {
      this.fail("No ranks")
      return
    }

    // Sort by rank
    players.sort((a, b) => a.rank - b.rank)

    this.editReply({
      content: players
        .map((player, i) => {
          const url = new URL(
            "/m=hiscore_oldschool_seasonal/hiscorepersonal",
            "https://secure.runescape.com",
          )
          url.searchParams.set("user1", player.name)

          return [
            [
              `${i + 1}. **${player.member.displayName}**`,
              `([${player.name}](<${url}>))`,
            ].join(" "),
            [`  Rank: ${player.rank}`, `Score: ${player.score}`].join(
              ` ${Unicode.middot} `,
            ),
          ].join("\n")
        })
        .join("\n"),
    })
  }
}
