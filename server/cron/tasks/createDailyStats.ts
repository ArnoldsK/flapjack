import { CommandExecuteModel } from "~/server/db/model/CommandExecute"
import { StaticDataModel } from "~/server/db/model/StaticData"
import { StatsModel } from "~/server/db/model/Stats"
import { StaticDataType } from "~/types/entity"
import { Task } from "~/types/tasks"

export const createDailyStats: Task = async (context) => {
  // Messages
  const statsModel = new StatsModel(context)
  const messagesPerDay = await statsModel.getApiItems()

  // Commands
  const commandsModel = new CommandExecuteModel(context)
  const commands = await commandsModel.getApiItems()

  const model = new StaticDataModel(context)
  await model.set(StaticDataType.Stats, {
    messagesPerDay,
    commands,
  })
}
