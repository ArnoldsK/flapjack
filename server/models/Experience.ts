import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../database"
import { ExperienceEntity } from "../entity/Experience"
import { isNonNullish } from "../utils/boolean"
import { getExperienceLevelData } from "../utils/experience"
import { EXP_PER_MESSAGE } from "../constants"

export interface ExperienceLevelData {
  exp: number
  lvl: number
  min: number
  max: number
  percent: number
}

export interface ExperienceRankData {
  member: GuildMember
  rank: number
  levelData: ExperienceLevelData
}

export class ExperienceModel {
  #member: GuildMember
  #repository: Repository<ExperienceEntity>

  constructor(member: GuildMember) {
    if (member.user.bot) {
      throw new Error("Not allowed for bots")
    }

    this.#member = member
    this.#repository = db.getRepository(ExperienceEntity)
  }

  async getExp() {
    const entity = await this.#repository.findOne({
      where: {
        userId: this.#member.id,
      },
    })

    return entity?.exp ?? 0
  }

  async addExp() {
    const exp = await this.getExp()

    await this.#repository.upsert(
      [
        {
          userId: this.#member.id,
          exp: exp + EXP_PER_MESSAGE,
        },
      ],
      ["userId"],
    )
  }

  async getAllRankData() {
    const entities = await this.#repository.find({
      order: { exp: "DESC" },
    })
    const rankByUserId = this.#getRankByUserId(entities)

    return entities.reduce<ExperienceRankData[]>((items, entity) => {
      const member = this.#member.guild.members.cache.get(entity.userId)
      const rank = rankByUserId.get(entity.userId)
      if (!member || !rank) {
        return items
      }

      const levelData = getExperienceLevelData(entity.exp)

      return [
        ...items,
        {
          member,
          rank,
          levelData,
        },
      ]
    }, [])
  }

  #getRankByUserId(entities: ExperienceEntity[]): Map<string, number> {
    const userIds = entities
      .map((entity) => this.#member.guild.members.cache.get(entity.userId)?.id)
      .filter(isNonNullish)

    return new Map<string, number>(userIds.map((userId, i) => [userId, i + 1]))
  }
}
