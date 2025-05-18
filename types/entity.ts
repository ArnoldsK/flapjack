import { BaseEntity } from "typeorm"
import { WeekRecapData } from "~/types/recap"
import { ApiStats } from "~/types/api"

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
