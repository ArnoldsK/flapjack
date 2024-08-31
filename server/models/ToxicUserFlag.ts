import { Repository } from "typeorm"
import { db } from "../database"
import ToxicUserFlagEntity from "../entity/ToxicUserFlag"

export type ToxicUserFlagCreateOrUpdateResult = Pick<
  ToxicUserFlagEntity,
  "userId" | "toxicCount" | "totalCount" | "toxicInARow" | "createdAt"
>

export class ToxicUserFlagModel {
  #repository: Repository<ToxicUserFlagEntity>

  constructor() {
    this.#repository = db.getRepository(ToxicUserFlagEntity)
  }

  async getAll() {
    return await this.#repository.find()
  }

  async getByUserId(userId: string) {
    return await this.#repository.findOne({
      where: {
        userId,
      },
    })
  }

  async createOrUpdate(input: {
    userId: string
    isToxic: boolean
  }): Promise<ToxicUserFlagCreateOrUpdateResult> {
    const entity = await this.getByUserId(input.userId)
    const upsertData = {
      userId: input.userId,
      toxicCount: (entity?.toxicCount ?? 0) + (input.isToxic ? 1 : 0),
      totalCount: (entity?.totalCount ?? 0) + 1,
      toxicInARow: input.isToxic ? (entity?.toxicInARow ?? 0) + 1 : 0,
      createdAt: entity?.createdAt ?? new Date(),
    }

    await this.#repository.upsert([upsertData], ["userId"])

    return upsertData
  }
}
