import { Repository } from "typeorm"
import { db } from "~/server/database"
import { CommandExecuteEntity } from "~/server/db/entity/CommandExecute"
import { EntityFields } from "~/types/entity"
import { ApiStatsCommand } from "~/types/api"

type CreateInput = Omit<EntityFields<CommandExecuteEntity>, "id" | "createdAt">

export class CommandExecuteModel {
  #repository: Repository<CommandExecuteEntity>

  constructor() {
    this.#repository = db.getRepository(CommandExecuteEntity)
  }

  async create(input: CreateInput) {
    await this.#repository
      .create({
        ...input,
        createdAt: new Date(),
      })
      .save()
  }

  async getApiItems(): Promise<ApiStatsCommand[]> {
    const entities = await this.#repository.find()

    return Array.from(
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
  }
}
