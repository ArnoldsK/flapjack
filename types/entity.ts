import { BaseEntity } from "typeorm"

/**
 * Returns TypeORM entity types without functions
 */
export type EntityFields<TEntity extends BaseEntity> = Omit<
  TEntity,
  "save" | "hasId" | "recover" | "reload" | "remove" | "softRemove"
>
