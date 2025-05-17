import { Repository } from "typeorm"
import { db } from "../../database"
import { CommandExecuteEntity } from "../entity/CommandExecute"
import { EntityFields } from "../../../types/entity"
import { ApiStatsCommand } from "../../../types/api"
import { BaseContext } from "../../../types"
import { CacheKey } from "../../cache"

type CreateInput = Omit<EntityFields<CommandExecuteEntity>, "id" | "createdAt">

export class CommandExecuteModel {
  #context: BaseContext
  #repository: Repository<CommandExecuteEntity>

  constructor(context: BaseContext) {
    this.#context = context
    this.#repository = db.getRepository(CommandExecuteEntity)
  }

  async create(input: CreateInput) {
    await this.#repository
      .create({
        ...input,
        createdAt: new Date(),
      })
      .save()

    this.#context.cache.set(CacheKey.StatsCommands, null)
  }

  async getApiItems(): Promise<ApiStatsCommand[]> {
    const entities = await this.#repository.find()

    const items: ApiStatsCommand[] = Array.from(
      entities.reduce((acc, entity) => {
        const name = entity.commandName
        const count = acc.get(name) ?? 0

        acc.set(name, count + 1)

        return acc
      }, new Map<string, number>()),
    )
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)

    this.#context.cache.set(CacheKey.StatsCommands, items)

    return items
  }
}
