import { getPoeScarabPrices } from "~/server/cron/tasks/getPoeScarabPrices"
import { StaticDataModel } from "~/server/db/model/StaticData"
import { createRoute } from "~/server/utils/routes"
import { StaticDataType } from "~/types/entity"

export default createRoute({
  path: "/api/scarabs",
  handler: async (context, _req, res) => {
    const model = new StaticDataModel(context)
    let scarabs = await model.get(StaticDataType.PoeScarabs)

    if (!scarabs) {
      scarabs = await getPoeScarabPrices(context)
    }

    res.json(scarabs)
  },
})
