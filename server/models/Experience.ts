import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../database"
import ExperienceEntity from "../entity/Experience"

export default class ExperienceModel {
  #member: GuildMember
  #repository: Repository<ExperienceEntity>

  constructor(member: GuildMember) {
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
          exp: exp + 1,
        },
      ],
      ["userId"],
    )
  }
}
