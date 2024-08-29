import { Repository } from "typeorm"
import { db } from "../database"
import ToxicUserFlagEntity from "../entity/ToxicUserFlag"

export class ToxicUserFlagModel {
  #repository: Repository<ToxicUserFlagEntity>

  constructor() {
    this.#repository = db.getRepository(ToxicUserFlagEntity)
  }

  async create(input: { userId: string; isToxic: boolean }) {
    await this.#repository
      .create({
        userId: input.userId,
        isToxic: input.isToxic,
        createdAt: new Date(),
      })
      .save()
  }

  async getAll() {
    return await this.#repository.find()
  }
}
