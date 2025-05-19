import { GuildMember } from "discord.js"
import { Repository } from "typeorm"

import { db } from "~/server/database"
import { RolesEntity } from "~/server/db/entity/Roles"

export class RolesModel {
  #member: GuildMember
  #repository: Repository<RolesEntity>

  constructor(member: GuildMember) {
    if (member.user.bot) {
      throw new Error("Not allowed for bots")
    }

    this.#member = member
    this.#repository = db.getRepository(RolesEntity)
  }

  async getAll() {
    const entities = await this.#repository.find()

    return entities
      .map((entity) => ({
        member: this.#member.guild.members.cache.get(entity.userId),
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

  async getRoleIds(): Promise<string[]> {
    const entity = await this.#repository.findOneBy({
      userId: this.#member.id,
    })

    if (!entity) {
      return []
    }

    return entity.roleIds
  }

  async setRoleIds(roleIds: string[]) {
    await this.#repository.upsert(
      [
        {
          userId: this.#member.id,
          roleIds,
        },
      ],
      ["userId"],
    )
  }

  async remove() {
    await this.#repository.delete({
      userId: this.#member.id,
    })
  }
}
