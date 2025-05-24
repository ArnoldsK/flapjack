import { RequiredEntityData } from "@mikro-orm/core"

import { BaseModel } from "~/server/base/Model"
import { CommandExecuteEntity } from "~/server/db/entity/CommandExecute"
import { ApiStatsCommand } from "~/types/api"

export class CommandExecuteModel extends BaseModel {
  protected override Entity = CommandExecuteEntity

  async create(input: RequiredEntityData<CommandExecuteEntity>) {
    await this.em.create(this.Entity, input)
    await this.em.flush()
  }

  async getApiItems(): Promise<ApiStatsCommand[]> {
    const entities = await this.em.findAll(this.Entity)

    return [
      ...entities.reduce((acc, entity) => {
        const name = entity.commandName
        const count = acc.get(name) ?? 0

        acc.set(name, count + 1)

        return acc
      }, new Map<string, number>()),
    ]
      .map(([name, count]) => ({
        name,
        count,
      }))
      .sort((a, b) => b.count - a.count)
  }
}
