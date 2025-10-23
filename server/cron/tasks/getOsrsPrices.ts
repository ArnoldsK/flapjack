import { z } from "zod"

import { StaticDataModel } from "~/server/db/model/StaticData"
import { StaticDataType } from "~/types/entity"
import { OsrsPriceData } from "~/types/osrs"
import { Task } from "~/types/tasks"

export const DATA_SCHEMA = z.object({
  data: z.record(
    z.string(),
    z.object({
      high: z.number().nullable(),
      low: z.number().nullable(),
    }),
  ),
})

export const getOsrsPrices: Task<Map<number, number>> = async (context) => {
  // Get API prices
  let data: z.TypeOf<typeof DATA_SCHEMA>
  try {
    const res = await fetch(
      "https://prices.runescape.wiki/api/v1/osrs/latest",
      {
        headers: {
          "User-Agent": "Allow Discord users to wear OSRS items",
        },
      },
    )
    data = DATA_SCHEMA.parse(await res.json())
  } catch {
    // Shrug
    return new Map()
  }

  // Parse data items
  const items: OsrsPriceData["items"] = []

  for (const [id, item] of Object.entries(data.data)) {
    const price = Number(item.high ?? item.low ?? 0)
    if (!price) continue

    items.push([Number(id), price])
  }

  // Save data items
  const model = new StaticDataModel(context)
  model.set(StaticDataType.OsrsPrices, { items })

  return new Map(items)
}
