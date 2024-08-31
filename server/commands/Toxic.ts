import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { ToxicUserFlagModel } from "../models/ToxicUserFlag"
import { appConfig } from "../config"
import { joinAsLines } from "../utils/string"

interface UserData {
  toxicCount: number
  notToxicCount: number
  totalCount: number
  toxicPercent: number
}

export default class ToxicCommand extends BaseCommand {
  static version = 2

  static command = new SlashCommandBuilder()
    .setName("toxic")
    .setDescription("Get users toxicity estimate")

  async execute() {
    const model = new ToxicUserFlagModel()
    const items = await model.getAll()

    // For now, take only users with at least 10 total items
    const toxic = items
      .filter((el) => el.totalCount >= 10)
      .map((el) => ({
        ...el,
        toxicPercent: Math.round((el.toxicCount / el.totalCount) * 100),
      }))
      .sort((a, b) => b.toxicPercent - a.toxicPercent)
      .slice(0, 10)

    if (!toxic.length) {
      this.reply({
        ephemeral: true,
        content: "Not enough data yet",
      })
      return
    }

    this.reply({
      embeds: [
        {
          title: "Toxicity estimate top 10",
          description: joinAsLines(
            ...toxic.map((item) => `<@${item.userId}> ${item.toxicPercent}%`),
          ),
        },
      ],
    })
  }
}
