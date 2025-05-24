import { RequiredEntityData } from "@mikro-orm/core"

import { BaseModel } from "~/server/base/Model"
import { PersistentThreadEntity } from "~/server/db/entity/PersistentThread"

export class PersistentThreadModel extends BaseModel {
  async getByThreadId(threadId: string) {
    return this.em.findOne(PersistentThreadEntity, { threadId })
  }

  async upsert(input: RequiredEntityData<PersistentThreadEntity>) {
    await this.em.upsert(PersistentThreadEntity, input)
  }
}
