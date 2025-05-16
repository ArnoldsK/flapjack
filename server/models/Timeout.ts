import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../database"
import { TimeoutEntity } from "../entity/Timeout"
import { d } from "../utils/date"

export class TimeoutModel {
  #member: GuildMember
  #repository: Repository<TimeoutEntity>

  constructor(member: GuildMember) {
    if (member.user.bot) {
      throw new Error("Not allowed for bots")
    }

    this.#member = member
    this.#repository = db.getRepository(TimeoutEntity)
  }

  async get() {
    return this.#repository.findOne({
      where: {
        userId: this.#member.id,
      },
    })
  }

  async set(input: Pick<TimeoutEntity, "durationMs" | "until">) {
    await this.#repository.upsert(
      [
        {
          userId: this.#member.id,
          durationMs: input.durationMs,
          until: input.until,
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
