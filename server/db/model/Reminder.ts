import { RequiredEntityData } from "@mikro-orm/core"

import { BaseModel } from "~/server/base/Model"
import { ReminderEntity } from "~/server/db/entity/Reminder"

export class ReminderModel extends BaseModel {
  protected override Entity = ReminderEntity

  async create(input: RequiredEntityData<ReminderEntity>) {
    await this.em.create(this.Entity, input)
    await this.em.flush()
  }

  async getAllExpired() {
    return this.em.find(this.Entity, {
      expiresAt: {
        $lte: new Date(),
      },
    })
  }

  async remove(ids: number[]) {
    if (ids.length === 0) return

    await this.em.nativeDelete(this.Entity, {
      id: {
        $in: ids,
      },
    })
  }
}
