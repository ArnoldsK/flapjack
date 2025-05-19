import { Guild } from "discord.js"
import { Repository } from "typeorm"

import { db } from "~/server/database"
import { StatsEntity } from "~/server/db/entity/Stats"
import { d } from "~/server/utils/date"
import { ApiStatsDay } from "~/types/api"
import { EntityFields } from "~/types/entity"

type CreateInput = Omit<EntityFields<StatsEntity>, "id" | "timestamp">

export class StatsModel {
  #repository: Repository<StatsEntity>

  constructor() {
    this.#repository = db.getRepository(StatsEntity)
  }

  async create(input: CreateInput) {
    await this.#repository
      .create({
        ...input,
        timestamp: new Date(),
      })
      .save()
  }

  async getApiItems(guild: Guild): Promise<ApiStatsDay[]> {
    const entities = await this.#repository.find()

    // Group items by day
    const statsByDateMap: Record<string, StatsEntity[]> = {}

    for (const item of entities) {
      const dateString = d(item.timestamp).format("YYYY-MM-DD")

      if (statsByDateMap[dateString]) {
        statsByDateMap[dateString].push(item)
      } else {
        statsByDateMap[dateString] = [item]
      }
    }

    // Stats per day data
    return Object.entries(statsByDateMap).map(([dateString, stats]) => {
      const userMessageCountMap = stats.reduce(
        (map, { userId }) => (
          map[userId]
            ? ++map[userId].messageCount
            : (map[userId] = {
                id: userId,
                displayName: guild.members.cache.get(userId)?.displayName ?? "",
                messageCount: 1,
              }),
          map
        ),
        {} as Record<string, ApiStatsDay["topUsers"][number]>,
      )

      const channelMessageCountMap = stats.reduce(
        (map, item) => (
          map[item.channelId]
            ? ++map[item.channelId].messageCount
            : (map[item.channelId] = {
                id: item.channelId,
                name: guild.channels.cache.get(item.channelId)?.name ?? "",
                messageCount: 1,
              }),
          map
        ),
        {} as Record<string, ApiStatsDay["topChannels"][number]>,
      )

      return {
        dateString,
        messageCount: stats.length,
        topUsers: Object.values(userMessageCountMap)
          .filter((el) => el.messageCount)
          .sort((a, b) => b.messageCount - a.messageCount),
        topChannels: Object.values(channelMessageCountMap)
          .filter((el) => el.messageCount)
          .sort((a, b) => b.messageCount - a.messageCount),
      }
    })
  }
}
