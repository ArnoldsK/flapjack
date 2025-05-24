import { StatsModel } from "~/server/db/model/Stats"
import { Task } from "~/types/tasks"

export const removeOldStats: Task = async (context) => {
  const statsModel = new StatsModel(context)
  await statsModel.removeOld()
}
