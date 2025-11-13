import { getScarabPriceOverlay } from "~/server/canvas/scarabPriceOverlay"
import { getPoeScarabPrices } from "~/server/cron/tasks/getPoeScarabPrices"
import { StaticDataModel } from "~/server/db/model/StaticData"
import { createRoute } from "~/server/utils/routes"
import { StaticDataType } from "~/types/entity"

export default createRoute({
  path: "/api/scarabs-overlay",
  handler: async (context, _req, res) => {
    const model = new StaticDataModel(context)
    let data = await model.get(StaticDataType.PoeScarabs)

    if (!data) {
      data = await getPoeScarabPrices(context)
    }

    const image = getScarabPriceOverlay({
      scarabs: data.scarabs,
      updatedAt: data.updatedAt,
    })

    res.contentType("image/png")
    res.send(image)
  },
})
