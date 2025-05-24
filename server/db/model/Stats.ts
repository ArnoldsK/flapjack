import { RequiredEntityData } from "@mikro-orm/core"

import { BaseModel } from "~/server/base/Model"
import { StatsEntity } from "~/server/db/entity/Stats"
import { d } from "~/server/utils/date"
import { ApiStatsDay } from "~/types/api"

export class StatsModel extends BaseModel {
  protected override Entity = StatsEntity

  async create(input: RequiredEntityData<StatsEntity>) {
    await this.em.create(this.Entity, input)
    await this.em.flush()
  }

  async getApiItems(): Promise<ApiStatsDay[]> {
    const entities = await this.em.findAll(this.Entity)
    const guild = this.context.guild()

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

  async removeOld() {
    const minDate = d().subtract(6, "months")

    await this.em.nativeDelete(this.Entity, {
      timestamp: {
        $lt: minDate.unix(),
      },
    })
  }
}
