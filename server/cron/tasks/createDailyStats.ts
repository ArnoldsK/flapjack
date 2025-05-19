import { CommandExecuteModel } from "~/server/db/model/CommandExecute"
import { StaticModel } from "~/server/db/model/Static"
import { StatsModel } from "~/server/db/model/Stats"
import { StaticDataType } from "~/types/entity"
import { Task } from "~/types/tasks"

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
