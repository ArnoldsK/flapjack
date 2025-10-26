import { z } from "zod"

import itemsJson from "./items.json"

import { ItemSlot, ItemWeaponVariant, OsrsItemData } from "~/types/osrs"

const items: OsrsItemData[] = z
  .array(
    z.object({
      slot: z.nativeEnum(ItemSlot),
      weaponVariant: z.nativeEnum(ItemWeaponVariant).nullable(),
      id: z.number(),
      name: z.string(),
      meleeAttack: z.number(),
      magicAttack: z.number(),
      rangedAttack: z.number(),
      meleeDefence: z.number(),
      magicDefence: z.number(),
      rangedDefence: z.number(),
      meleeStrength: z.number(),
      rangedStrength: z.number(),
      magicStrength: z.number(),
      speed: z.number().nullable(),
    }),
  )
  .parse(itemsJson)

export const osrsItemByLcName = new Map<string, OsrsItemData>(
  items.map((item) => [item.name.toLowerCase(), item]),
)
