import { Repository } from "typeorm"
import { db } from "../../database"
import { RecapEntity } from "../entity/Recap"
import { WeekRecapData } from "../../../types/recap"
import { CacheKey } from "../../cache"
import { BaseContext } from "../../../types"

export class RecapModel {
  #context: BaseContext
  #repository: Repository<RecapEntity>

  constructor(context: BaseContext) {
    this.#context = context
    this.#repository = db.getRepository(RecapEntity)
  }

  async get() {
    const cached = this.#context.cache.get(CacheKey.WeekRecap)
    if (cached) {
      return cached
    }

    const entity = await this.#repository.findOne({
      where: { id: 1 },
    })
    const data = entity?.value ?? null

    this.#context.cache.set(CacheKey.WeekRecap, data)

    return data
  }

  async set(value: WeekRecapData) {
    await this.#repository.update({ id: 1 }, { value })

    this.#context.cache.set(CacheKey.WeekRecap, value)
  }
}
