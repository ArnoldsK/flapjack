import { z } from "zod"

import { StaticDataModel } from "~/server/db/model/StaticData"
import { isNonNullish } from "~/server/utils/boolean"
import { BaseContext } from "~/types"
import { StaticDataType } from "~/types/entity"
import { PoeScarab } from "~/types/poe"

const API_BASE_URL = "https://poe.ninja"
const CDN_BASE_URL = "https://web.poecdn.com"

const fetchJson = async <T extends z.ZodType>(
  url: URL,
  schema: T,
): Promise<Awaited<z.TypeOf<T>>> => {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Scarab price data for a Discord server",
    },
  })
  const json = await res.json()

  return schema.parse(json)
}

const getLeagueName = async (): Promise<string> => {
  const url = new URL("/poe1/api/data/index-state", API_BASE_URL)
  url.searchParams.set("league", "Keepers")
  url.searchParams.set("type", "Scarab")

  const data = await fetchJson(
    url,
    z.object({
      economyLeagues: z.array(
        z.object({
          name: z.string(),
        }),
      ),
    }),
  )

  return data.economyLeagues[0].name
}

const getScarabData = async (league: string): Promise<PoeScarab[]> => {
  const url = new URL(
    "/poe1/api/economy/exchange/current/overview",
    API_BASE_URL,
  )
  url.searchParams.set("league", league)
  url.searchParams.set("type", "Scarab")

  const data = await fetchJson(
    url,
    z.object({
      lines: z.array(
        z.object({
          id: z.string(),
          primaryValue: z.number(),
        }),
      ),
      items: z.array(
        z.object({
          id: z.string(),
          name: z.string(),
          image: z.string(),
        }),
      ),
    }),
  )

  return data.lines
    .map((line) => {
      const item = data.items.find((el) => el.id === line.id)
      if (!item) {
        return null
      }

      return {
        name: item.name,
        chaosValue: line.primaryValue,
        icon: new URL(item.image, CDN_BASE_URL).toString(),
      } satisfies PoeScarab
    })
    .filter(isNonNullish)
}

export const getPoeScarabPrices = async (context: BaseContext) => {
  // Use cached if possible
  const model = new StaticDataModel(context)
  let scarabData = await model.get(StaticDataType.PoeScarabs)

  if (scarabData) {
    return scarabData
  }

  // Otherwise get new data
  const league = await getLeagueName()
  const scarabs = await getScarabData(league)

  scarabData = {
    league,
    scarabs,
    updatedAt: new Date(),
  }

  // Update static data
  await model.set(StaticDataType.PoeScarabs, scarabData)

  // Return final data
  return scarabData
}
