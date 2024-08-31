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

    const byUserId = items.reduce<Record<string, UserData>>((result, item) => {
      const data = result[item.userId] || {
        toxicCount: 0,
        notToxicCount: 0,
        totalCount: 0,
        toxicPercent: 0,
      }

      data.totalCount++
      if (item.isToxic) {
        data.toxicCount++
      } else {
        data.notToxicCount++
      }
      data.toxicPercent = Math.round((data.toxicCount / data.totalCount) * 100)

      result[item.userId] = data
      return result
    }, {})

    // For now, take only users with at least 10 total items
    const toxic = Object.entries(byUserId)
      .map(([userId, data]) => ({
        userId,
        ...data,
      }))
      .filter((el) => el.totalCount >= 10)
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
