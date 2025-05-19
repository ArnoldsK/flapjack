import dayjs from "dayjs"

import { StatsEntity } from "~/server/db/entity/Stats"
import { Task } from "~/types/tasks"

export const removeOldStats: Task = async (_context) => {
  const minDate = dayjs().subtract(6, "months")

  await StatsEntity.createQueryBuilder()
    .delete()
    .where("`timestamp` < :ts", {
      ts: minDate.unix(),
    })
    .execute()
}
