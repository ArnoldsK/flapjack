import { ApiStats } from "~/types/api"
import { OsrsPriceData } from "~/types/osrs"
import { PoeScarabData } from "~/types/poe"
import { WeekRecapData } from "~/types/recap"

export enum StaticDataType {
  WeekRecap = "weekRecap",
  Stats = "stats",
  PoeScarabs = "poeScarabs",
  OsrsPrices = "osrsPrices",
}

export type StaticData = {
  [StaticDataType.WeekRecap]: WeekRecapData
  [StaticDataType.Stats]: ApiStats
  [StaticDataType.PoeScarabs]: PoeScarabData
  [StaticDataType.OsrsPrices]: OsrsPriceData
}
