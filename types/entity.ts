import { ApiStats } from "~/types/api"
import { WeekRecapData } from "~/types/recap"

export enum StaticDataType {
  WeekRecap = "weekRecap",
  Stats = "stats",
}

export type StaticData = {
  [StaticDataType.WeekRecap]: WeekRecapData
  [StaticDataType.Stats]: ApiStats
}
