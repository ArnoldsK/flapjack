import { Task } from "~/types/tasks"
import { StaticModel } from "~/server/db/model/Static"
import { StaticDataType } from "~/types/entity"
import { StatsModel } from "~/server/db/model/Stats"
import { CommandExecuteModel } from "~/server/db/model/CommandExecute"

export const createDailyStats: Task = async (context) => {
  const guild = context.guild()

  // Messages
  const statsModel = new StatsModel()
  const messagesPerDay = await statsModel.getApiItems(guild)

  // Commands
  const commandsModel = new CommandExecuteModel()
  const commands = await commandsModel.getApiItems()

  const model = new StaticModel(StaticDataType.Stats)
  await model.set({
    messagesPerDay,
    commands,
  })
}
