import { LessThanOrEqual, Repository } from "typeorm"
import { db } from "../database"
import { CommandExecuteEntity } from "../entity/CommandExecute"

interface CreateInput {
  channelId: string
  userId: string
  commandName: string
  input: string
}

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
}
