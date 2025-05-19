import { Repository } from "typeorm"

import { db } from "~/server/database"
import { PersistentThreadEntity } from "~/server/db/entity/PersistentThread"
import { EntityFields } from "~/types/entity"

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
