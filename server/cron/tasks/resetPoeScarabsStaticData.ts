import { StaticDataModel } from "~/server/db/model/StaticData"
import { StaticDataType } from "~/types/entity"
import { Task } from "~/types/tasks"

/**
 * Removes the cached PoE scarab prices static data.
 * This forces the system to fetch fresh data on the next request.
 */
export const resetPoeScarabsStaticData: Task = async (context) => {
  const model = new StaticDataModel(context)
  await model.delete(StaticDataType.PoeScarabs)
}
