import dayjs from "dayjs"

import { Task } from "../../../types/tasks"
import { StatsEntity } from "../../db/entity/Stats"

export const removeOldStats: Task = async (context) => {
  await StatsEntity.createQueryBuilder().delete().execute()

  const minDate = dayjs().subtract(6, "months")

  const entities = await StatsEntity.createQueryBuilder()
    .where("`timestamp` < :ts", {
      ts: minDate.unix(),
    })
    .getRawMany()

  if (entities.length) {
    await StatsEntity.createQueryBuilder()
      .delete()
      .whereInIds(entities.map(({ id }) => id))
      .execute()
  }
}
