import { Repository } from "typeorm"
import { db } from "../../database"
import { StatsEntity } from "../entity/Stats"
import { EntityFields } from "../../../types/entity"
import { ApiStatsDay } from "../../../types/api"
import { BaseContext } from "../../../types"
import { CacheKey } from "../../cache"
import { d } from "../../utils/date"

type CreateInput = Omit<EntityFields<StatsEntity>, "id" | "timestamp">

export class StatsModel {
  #context: BaseContext
  #repository: Repository<StatsEntity>

  constructor(context: BaseContext) {
    this.#context = context
    this.#repository = db.getRepository(StatsEntity)
  }

  async create(input: CreateInput) {
    await this.#repository
      .create({
        ...input,
        timestamp: new Date(),
      })
      .save()

    this.#context.cache.set(CacheKey.StatsMessagesPerDay, null)
  }

  // TODO: this needs a rougher cache
  async getApiItems(): Promise<ApiStatsDay[]> {
    const cached = this.#context.cache.get(CacheKey.StatsMessagesPerDay)
    if (cached) {
      return cached
    }

    const entities = await this.#repository.find()
    const guild = this.#context.guild()

    // Group items by dates
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
    const items: ApiStatsDay[] = Object.entries(statsByDateMap).map(
      ([dateString, stats]) => {
        const userMessageCountMap = stats.reduce(
          (map, { userId }) => (
            map[userId]
              ? ++map[userId].messageCount
              : (map[userId] = {
                  id: userId,
                  displayName:
                    guild.members.cache.get(userId)?.displayName ?? "",
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
      },
    )

    this.#context.cache.set(CacheKey.StatsMessagesPerDay, items)

    return items
  }
}
