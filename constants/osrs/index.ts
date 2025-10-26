import { z } from "zod"

import itemsJson from "./items.json"

import { ItemSlot, ItemWeaponVariant, OsrsItemData } from "~/types/osrs"

const items: OsrsItemData[] = z
  .array(
    z.object({
      id: z.number(),
      name: z.string(),
      slot: z.nativeEnum(ItemSlot),
      weaponVariant: z.nativeEnum(ItemWeaponVariant).nullable(),
    }),
  )
  .parse(itemsJson)

export const osrsItemByLcName = new Map<string, OsrsItemData>(
  items.map((item) => [item.name.toLowerCase(), item]),
)
