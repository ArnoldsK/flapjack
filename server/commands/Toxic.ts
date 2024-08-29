import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { permission, PermissionFlags } from "../utils/permission"
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
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("toxic")
    .setDescription("Get users toxicity estimate")

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.Administrator],
  })

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

    if (!toxic) {
      this.reply({
        ephemeral: true,
        content: "Not enough data yet",
      })
      return
    }

    this.reply({
      ephemeral:
        this.channel.parentId !== appConfig.discord.ids.categories.moderation,
      embeds: [
        {
          title: "Toxicity estimate",
          description: joinAsLines(
            ...toxic.map((item) => `<@${item.userId}> ${item.toxicPercent}%`),
          ),
        },
      ],
    })
  }
}
