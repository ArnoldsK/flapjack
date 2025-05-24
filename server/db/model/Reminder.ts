import { RequiredEntityData } from "@mikro-orm/core"

import { BaseModel } from "~/server/base/Model"
import { ReminderEntity } from "~/server/db/entity/Reminder"

export class ReminderModel extends BaseModel {
  async create(input: RequiredEntityData<ReminderEntity>) {
    await this.em.create(ReminderEntity, input)
    await this.em.flush()
  }

  async getAllExpired() {
    return this.em.find(ReminderEntity, {
      expiresAt: {
        $lte: new Date(),
      },
    })
  }

  async remove(ids: number[]) {
    if (ids.length === 0) return

    await this.em.nativeDelete(ReminderEntity, {
      id: {
        $in: ids,
      },
    })
  }
}
