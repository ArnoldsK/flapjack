import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../../database"
import { RsLeagueEntity } from "../entity/RsLeague"
import { d } from "../../utils/date"

export class RsLeagueModel {
  #member: GuildMember
  #repository: Repository<RsLeagueEntity>

  constructor(member: GuildMember) {
    if (member.user.bot) {
      throw new Error("Not allowed for bots")
    }

    this.#member = member
    this.#repository = db.getRepository(RsLeagueEntity)
  }

  async getAll() {
    const entities = await this.#repository.find()

    return entities
      .map((entity) => ({
        member: this.#member.guild.members.cache.get(entity.userId),
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

  async setName(name: string) {
    await this.#repository.upsert(
      [
        {
          userId: this.#member.id,
          name,
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

  async removeByUserId(userId: string) {
    await this.#repository.delete({ userId })
  }
}
