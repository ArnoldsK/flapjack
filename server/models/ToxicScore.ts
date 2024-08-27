import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../database"
import ToxicScoreEntity from "../entity/ToxicScore"

export interface ToxicScoreInput {
  score: number
  info: string
}

export default class ToxicScoreModel {
  #member: GuildMember
  #repository: Repository<ToxicScoreEntity>

  constructor(member: GuildMember) {
    if (member.user.bot) {
      throw new Error("Not allowed for bots")
    }

    this.#member = member
    this.#repository = db.getRepository(ToxicScoreEntity)
  }

  async addScore(input: ToxicScoreInput) {
    await this.#repository.create({
      userId: this.#member.id,
      score: input.score,
      info: input.info,
    })
  }
}
