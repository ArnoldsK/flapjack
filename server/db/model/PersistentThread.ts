import { Repository } from "typeorm"
import { db } from "../../database"
import { PersistentThreadEntity } from "../entity/PersistentThread"
import { EntityFields } from "../../types/entity"
import { GuildMember } from "discord.js"

type CreateInput = Omit<EntityFields<PersistentThreadEntity>, "id">

export class PersistentThreadModel {
  #repository: Repository<PersistentThreadEntity>

  constructor() {
    this.#repository = db.getRepository(PersistentThreadEntity)
  }

  async getByThreadId(threadId: string) {
    return this.#repository.findOne({
      where: { threadId },
    })
  }

  async upsert(input: CreateInput) {
    await this.#repository.upsert([input], ["threadId"])
  }
}
