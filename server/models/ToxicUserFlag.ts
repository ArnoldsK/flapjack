import { Repository } from "typeorm"
import { db } from "../database"
import ToxicUserFlagEntity from "../entity/ToxicUserFlag"

export class ToxicUserFlagModel {
  #repository: Repository<ToxicUserFlagEntity>

  constructor() {
    this.#repository = db.getRepository(ToxicUserFlagEntity)
  }

  async getAll() {
    return await this.#repository.find()
  }

  async create(input: { userId: string; isToxic: boolean; reason: string }) {
    await this.#repository.create({
      userId: input.userId,
      isToxic: input.isToxic,
      reason: input.reason,
      createdAt: new Date(),
    })
  }
}