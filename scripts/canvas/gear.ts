import { writeFile } from "node:fs/promises"
import path from "node:path"

import { osrsItemIdByName } from "~/constants/osrs"
import { getGearImage } from "~/server/canvas/gearImage"
import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { isNonNullish } from "~/server/utils/boolean"
import { GearSlot } from "~/types/osrs"

const itemByName = (
  itemName: string,
): Pick<OsrsItemsEntity, "itemId" | "itemSlot" | "itemName"> | null => {
  for (const [slot, itemIdByName] of Object.entries(osrsItemIdByName)) {
    if (itemIdByName.has(itemName)) {
      return {
        itemId: itemIdByName.get(itemName)!,
        itemName,
        itemSlot: slot as GearSlot,
      }
    }
  }

  return null
}

const run = async () => {
  const buffer = await getGearImage({
    avatarUrl: "https://i.imgur.com/HWDfNVH.png",
    items: [
      "Blue wizard robe",
      "Blue skirt",
      "Magic shield",
      "Mixed flowers",
      "Explorer backpack",
    ]
      .map(itemByName)
      .filter(isNonNullish),
  })

  const file = path.join(__dirname, "gear.png")

  await writeFile(file, buffer as unknown as string)

  console.log("Saved as", file)
}

run()
