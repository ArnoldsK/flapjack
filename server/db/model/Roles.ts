import { GuildMember } from "discord.js"

import { BaseModel } from "~/server/base/Model"
import { RolesEntity } from "~/server/db/entity/Roles"

export class RolesModel extends BaseModel {
  protected override Entity = RolesEntity

  async getAll() {
    const entities = await this.em.findAll(this.Entity)
    const members = this.context.guild().members.cache

    return entities
      .map((entity) => ({
        member: members.get(entity.userId),
        roleIds: entity.roleIds,
      }))
      .filter(
        (
          el,
        ): el is {
          member: GuildMember
          roleIds: string[]
        } => !!el.member,
      )
  }

  async getRoleIds(userId: string): Promise<string[]> {
    const entity = await this.em.findOne(this.Entity, { userId })

    if (!entity) {
      return []
    }

    return entity.roleIds
  }

  async setRoleIds(userId: string, roleIds: string[]) {
    await this.em.upsert(this.Entity, {
      userId,
      roleIds,
    })
  }
}
