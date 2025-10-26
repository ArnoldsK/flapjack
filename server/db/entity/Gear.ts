import { Entity, Opt, PrimaryKey, Property } from "@mikro-orm/core"

import { ItemSlot, ItemWeaponVariant } from "~/types/osrs"

@Entity()
export class GearEntity {
  @PrimaryKey({ autoincrement: true })
  id: number & Opt

  @Property()
  userId: string

  @Property()
  itemId: number

  @Property()
  slot: ItemSlot

  @Property({ nullable: true })
  weaponVariant: ItemWeaponVariant | null

  @Property()
  name: string

  @Property({
    type: "bigint",
    unsigned: true,
  })
  boughtPrice: bigint

  @Property()
  createdAt: Date & Opt = new Date()
}
