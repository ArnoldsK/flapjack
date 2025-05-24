import { RequiredEntityData } from "@mikro-orm/core"

import { BaseModel } from "~/server/base/Model"
import { PersistentThreadEntity } from "~/server/db/entity/PersistentThread"

export class PersistentThreadModel extends BaseModel {
  protected override Entity = PersistentThreadEntity

  async getByThreadId(threadId: string) {
    return this.em.findOne(this.Entity, { threadId })
  }

  async upsert(input: RequiredEntityData<PersistentThreadEntity>) {
    await this.em.upsert(this.Entity, input)
  }
}
