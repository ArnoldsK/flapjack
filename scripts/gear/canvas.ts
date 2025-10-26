import { writeFile } from "node:fs/promises"
import path from "node:path"

import { items } from "~/scripts/gear/_init"
import { getGearImage } from "~/server/canvas/gearImage"

const run = async () => {
  const buffer = await getGearImage({
    items: items.map((item) => ({
      itemId: item.id,
      name: item.name,
      slot: item.slot,
    })),
  })

  const file = path.join(__dirname, "gear.png")

  await writeFile(file, buffer as unknown as string)

  console.log("Saved as", path.basename(file))
}

run()
