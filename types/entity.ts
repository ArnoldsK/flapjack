import { BaseEntity } from "typeorm"
import { WeekRecapData } from "./recap"

/**
 * Returns TypeORM entity types without functions
 */
export type EntityFields<TEntity extends BaseEntity> = Omit<
  TEntity,
  "save" | "hasId" | "recover" | "reload" | "remove" | "softRemove"
>

export enum StaticDataType {
  WeekRecap = "weekRecap",
}

export type StaticData = {
  [StaticDataType.WeekRecap]: WeekRecapData
}
