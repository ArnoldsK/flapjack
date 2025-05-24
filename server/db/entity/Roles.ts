import {
  ArrayType,
  Entity,
  PrimaryKey,
  Property,
  Unique,
} from "@mikro-orm/core"

@Entity()
export class RolesEntity {
  @PrimaryKey()
  id: number

  @Property()
  @Unique()
  userId: string

  @Property({
    type: ArrayType,
    columnType: "text",
  })
  roleIds: string[]
}
