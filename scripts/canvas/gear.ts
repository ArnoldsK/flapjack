import { existsSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { osrsItemIdByName } from "~/constants/osrs"
import { getGearImage } from "~/server/canvas/gearImage"
import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { isNonNullish } from "~/server/utils/boolean"
import { GearSlot } from "~/types/osrs"

const NAMES_FILE = path.join(__dirname, "/names.yaml")

const run = async () => {
  const namesFile = existsSync(NAMES_FILE) && (await readFile(NAMES_FILE))
  if (!namesFile) {
    await writeFile(NAMES_FILE, "")

    throw new Error(
      `Add names in ${path.basename(NAMES_FILE)} separated by a new line.`,
    )
  }

  const names = namesFile
    .toString()
    .split("\n")
    .map((el) => el.trim())
    .filter((el) => !!el && !el.startsWith("#"))

  const buffer = await getGearImage({
    avatarUrl: "https://i.imgur.com/HWDfNVH.png",
    items: names.map(itemByName).filter(isNonNullish),
  })

  const file = path.join(__dirname, "gear.png")

  await writeFile(file, buffer as unknown as string)

  console.log("Saved as", file)
}

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

run()
