import {
  ArrayType,
  Entity,
  Opt,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core"

@Entity()
export class RolesEntity {
  @PrimaryKey({ autoincrement: true })
  id: number & Opt

  @Property()
  @Unique()
  userId: string

  @Property({
    type: ArrayType,
    columnType: "text",
  })
  roleIds: string[]
}
