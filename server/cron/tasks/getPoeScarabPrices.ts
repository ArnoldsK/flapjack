import { NinjaAPI } from "poe-api-manager"
import { z } from "zod"

import { StaticDataModel } from "~/server/db/model/StaticData"
import { assert } from "~/server/utils/error"
import { StaticDataType } from "~/types/entity"
import { PoeScarab, PoeScarabData } from "~/types/poe"
import { Task } from "~/types/tasks"

export const getPoeScarabPrices: Task<PoeScarabData> = async (context) => {
  // #############################################################################
  // Get active league
  // #############################################################################
  let league = ""
  try {
    const res = await fetch("https://poe.ninja/api/data/index-state")
    const data = await res.json()
    // yolo
    league = data.economyLeagues[0].name as string
  } catch {
    // Shrug
  }
  assert(!!league, "Could not determine the active PoE league")

  // #############################################################################
  // Get scarab data
  // #############################################################################
  const api = new NinjaAPI(league)

  const scarabDataRaw = await api.itemView.scarab.getData()
  const scarabData = z
    .array(
      z.object({
        name: z.string(),
        chaosValue: z.number(),
        icon: z.string().url(),
      }),
    )
    .parse(scarabDataRaw)

  // #############################################################################
  // Save as static data
  // #############################################################################
  const model = new StaticDataModel(context)

  const staticData: PoeScarabData = {
    league,
    scarabs: scarabData.map(
      (scarab) =>
        ({
          name: scarab.name,
          chaosValue: scarab.chaosValue,
          icon: scarab.icon,
        }) satisfies PoeScarab,
    ),
    updatedAt: new Date(),
  }

  await model.set(StaticDataType.PoeScarabs, staticData)

  // #############################################################################
  // Return data for manual updates
  // #############################################################################
  return staticData
}
