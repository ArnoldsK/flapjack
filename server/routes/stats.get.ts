import { createRoute } from "../utils/routes"
import { ApiStats } from "../../types/api"
import { StaticModel } from "../db/model/Static"
import { StaticDataType } from "../../types/entity"

export default createRoute({
  path: "/api/stats",
  handler: async (_context, _req, res) => {
    const model = new StaticModel(StaticDataType.Stats)
    const stats = await model.get()

    res.json(
      (stats ?? {
        messagesPerDay: [],
        commands: [],
      }) satisfies ApiStats,
    )
  },
})
