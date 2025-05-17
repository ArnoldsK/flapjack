import { BaseEntity } from "typeorm"
import { WeekRecapData } from "./recap"
import { ApiStats } from "./api"

/**
 * Returns TypeORM entity types without functions
 */
export type EntityFields<TEntity extends BaseEntity> = Omit<
  TEntity,
  "save" | "hasId" | "recover" | "reload" | "remove" | "softRemove"
>

export enum StaticDataType {
  WeekRecap = "weekRecap",
  Stats = "stats",
}

export type StaticData = {
  [StaticDataType.WeekRecap]: WeekRecapData
  [StaticDataType.Stats]: ApiStats
}
