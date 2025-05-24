import { GuildMember } from "discord.js"

import { BaseModel } from "~/server/base/Model"
import { RolesEntity } from "~/server/db/entity/Roles"

export class RolesModel extends BaseModel {
  async getAll() {
    const entities = await this.em.findAll(RolesEntity)
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
    const entity = await this.em.findOne(RolesEntity, { userId })

    if (!entity) {
      return []
    }

    return entity.roleIds
  }

  async setRoleIds(userId: string, roleIds: string[]) {
    await this.em.upsert({
      userId,
      roleIds,
    })
  }
}
