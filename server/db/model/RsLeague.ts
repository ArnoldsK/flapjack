import { GuildMember } from "discord.js"

import { BaseModel } from "~/server/base/Model"
import { RsLeagueEntity } from "~/server/db/entity/RsLeague"

export class RsLeagueModel extends BaseModel {
  protected override Entity = RsLeagueEntity

  async getAll() {
    const entities = await this.em.findAll(this.Entity)
    const members = this.context.guild().members.cache

    return entities
      .map((entity) => ({
        member: members.get(entity.userId),
        name: entity.name,
      }))
      .filter(
        (
          el,
        ): el is {
          member: GuildMember
          name: string
        } => !!el.member,
      )
  }

  async setName(userId: string, name: string) {
    await this.em.upsert({
      userId,
      name,
    })
  }

  async remove(userId: string) {
    await this.em.nativeDelete(this.Entity, { userId })
  }
}
