import { GuildMember } from "discord.js"

import { EXP_PER_MESSAGE } from "~/constants"
import { BaseModel } from "~/server/base/Model"
import { ExperienceEntity } from "~/server/db/entity/Experience"
import { isNonNullish } from "~/server/utils/boolean"
import { getExperienceLevelData } from "~/server/utils/experience"

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

export class ExperienceModel extends BaseModel {
  protected override Entity = ExperienceEntity

  async getExp(userId: string) {
    const entity = await this.em.findOne(this.Entity, { userId })

    return entity?.exp ?? 0
  }

  async addExp(userId: string) {
    const exp = await this.getExp(userId)

    const entity = await this.em.upsert(this.Entity, {
      userId,
      exp: exp + EXP_PER_MESSAGE,
    })

    return {
      oldExp: exp,
      newExp: entity.exp,
    }
  }

  async getAllRankData() {
    const entities = await this.em.findAll(this.Entity, {
      orderBy: { exp: "DESC" },
    })
    const rankByUserId = this.#mapRankByUserId(entities)
    const members = this.context.guild().members.cache

    return entities.reduce<ExperienceRankData[]>((items, entity) => {
      const member = members.get(entity.userId)
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

  #mapRankByUserId(entities: ExperienceEntity[]): Map<string, number> {
    const userIds = entities
      .map(
        (entity) => this.context.guild().members.cache.get(entity.userId)?.id,
      )
      .filter(isNonNullish)

    return new Map<string, number>(userIds.map((userId, i) => [userId, i + 1]))
  }
}
