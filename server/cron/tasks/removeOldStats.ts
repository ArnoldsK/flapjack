import dayjs from "dayjs"

import { Task } from "../../../types/tasks"
import { StatsEntity } from "../../db/entity/Stats"

export const removeOldStats: Task = async (_context) => {
  const minDate = dayjs().subtract(6, "months")

  await StatsEntity.createQueryBuilder()
    .delete()
    .where("`timestamp` < :ts", {
      ts: minDate.unix(),
    })
    .execute()
}
