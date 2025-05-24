import { StaticDataModel } from "~/server/db/model/StaticData"
import { createRoute } from "~/server/utils/routes"
import { ApiStats } from "~/types/api"
import { StaticDataType } from "~/types/entity"

export default createRoute({
  path: "/api/stats",
  handler: async (context, _req, res) => {
    const model = new StaticDataModel(context)
    const stats = await model.get(StaticDataType.Stats)

    res.json(
      (stats ?? {
        messagesPerDay: [],
        commands: [],
      }) satisfies ApiStats,
    )
  },
})
