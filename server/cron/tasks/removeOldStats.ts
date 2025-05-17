import { DISCORD_IDS } from "../../../constants"
import { Task } from "../../../types/tasks"
import { StatsEntity } from "../../db/entity/Stats"
import dayjs from "dayjs"

export const removeOldStats: Task = async (context) => {
  await StatsEntity.createQueryBuilder().delete().execute()

  const minDate = dayjs().subtract(6, "months")

  const entities = await StatsEntity.createQueryBuilder()
    .select("id")
    .where("`timestamp` < :ts", {
      ts: minDate.format("X"),
    })
    .getRawMany()

  if (entities.length) {
    await StatsEntity.createQueryBuilder()
      .delete()
      .whereInIds(entities.map(({ id }) => id))
      .execute()
  }
}
