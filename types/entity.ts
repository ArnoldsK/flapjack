import { ApiStats } from "~/types/api"
import { PoeScarabData } from "~/types/poe"
import { WeekRecapData } from "~/types/recap"

export enum StaticDataType {
  WeekRecap = "weekRecap",
  Stats = "stats",
  PoeScarabs = "poeScarabs",
}

export type StaticData = {
  [StaticDataType.WeekRecap]: WeekRecapData
  [StaticDataType.Stats]: ApiStats
  [StaticDataType.PoeScarabs]: PoeScarabData
}
