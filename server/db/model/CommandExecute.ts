import { Repository } from "typeorm"
import { db } from "../../database"
import { CommandExecuteEntity } from "../entity/CommandExecute"
import { EntityFields } from "../../types/entity"
import { ApiStatsCommand } from "../../types/api"

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

  async getApiCommands(): Promise<ApiStatsCommand[]> {
    const commands = await this.#repository.find()

    return Array.from(
      commands.reduce((acc, command) => {
        const name = command.commandName
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
