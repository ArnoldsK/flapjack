import { LessThanOrEqual, Repository } from "typeorm"
import { db } from "../database"
import ReminderEntity from "../entity/Reminder"

interface CreateInput {
  channelId: string
  messageId: string
  userId: string
  value: string
  expiresAt: Date
}

export class ReminderModel {
  #repository: Repository<ReminderEntity>

  constructor() {
    this.#repository = db.getRepository(ReminderEntity)
  }

  async create(input: CreateInput) {
    await this.#repository
      .create({
        ...input,
        createdAt: new Date(),
      })
      .save()
  }

  async getAllExpired() {
    return this.#repository.find({
      where: {
        expiresAt: LessThanOrEqual(new Date()),
      },
    })
  }
}
