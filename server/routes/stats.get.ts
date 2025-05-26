import { createDailyStats } from "~/server/cron/tasks/createDailyStats"
import { StaticDataModel } from "~/server/db/model/StaticData"
import { createRoute } from "~/server/utils/routes"
import { StaticDataType } from "~/types/entity"

export default createRoute({
  path: "/api/stats",
  handler: async (context, _req, res) => {
    const model = new StaticDataModel(context)
    let stats = await model.get(StaticDataType.Stats)

    if (!stats) {
      stats = await createDailyStats(context)
    }

    res.json(stats)
  },
})
