import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core"

import { OsrsItemSlot } from "~/types/osrs"

@Entity()
export class OsrsItemsEntity {
  @PrimaryKey({ autoincrement: true })
  id: number & Opt

  @PrimaryKey()
  userId: string

  @Property()
  itemId: number

  @Property()
  itemSlot: OsrsItemSlot

  @Property()
  itemName: string

  @Property({
    type: "bigint",
    unsigned: true,
  })
  itemBoughtPrice: bigint

  @Property()
  createdAt: Date & Opt = new Date()
}
