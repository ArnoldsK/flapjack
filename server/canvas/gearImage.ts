import path from "node:path"

import { createCanvas, Image, loadImage } from "@napi-rs/canvas"

import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { GearSlot } from "~/types/osrs"

type Item = Pick<OsrsItemsEntity, "itemId" | "itemSlot" | "itemName">

interface Position {
  x: number
  y: number
}

const SLOT_SIZE = 32
const SLOT_POSITION = new Map<GearSlot, Position>([
  [GearSlot.Head, { x: 58, y: 2 }],
  [GearSlot.Cape, { x: 17, y: 41 }],
  [GearSlot.Neck, { x: 58, y: 41 }],
  [GearSlot.OneHanded, { x: 2, y: 80 }],
  [GearSlot.TwoHanded, { x: 2, y: 80 }],
  [GearSlot.Body, { x: 58, y: 80 }],
  [GearSlot.Shield, { x: 114, y: 80 }],
  [GearSlot.Legs, { x: 58, y: 120 }],
  [GearSlot.Hands, { x: 2, y: 160 }],
  [GearSlot.Feet, { x: 58, y: 160 }],
  [GearSlot.Ring, { x: 114, y: 160 }],
])

export const getGearImage = async ({
  items,
}: {
  items: Item[]
}): Promise<Buffer> => {
  // Load inventory image
  const inventoryImage = await loadImage(
    path.join("public", "static", "gear", "inventory.png"),
  )

  // Canvas
  const canvas = createCanvas(inventoryImage.width, inventoryImage.height)
  const ctx = canvas.getContext("2d")

  // Draw inventory
  ctx.drawImage(inventoryImage, 0, 0, canvas.width, canvas.height)

  // Draw slot items
  if (items.length > 0) {
    const emptySlotImage: Image = await loadImage(
      path.join("public", "static", "gear", "empty-slot.png"),
    )

    const imageBySlot = new Map<GearSlot, Image>(
      await Promise.all(
        items.map(
          async (item) =>
            [
              item.itemSlot,
              await loadImage(
                `https://secure.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${item.itemId}`,
              ),
            ] as const,
        ),
      ),
    )

    for (const slot of Object.values(GearSlot)) {
      const itemImage = imageBySlot.get(slot)
      if (!itemImage) continue

      const slotPos = SLOT_POSITION.get(slot)
      if (!slotPos) continue

      ctx.drawImage(emptySlotImage, slotPos.x, slotPos.y, SLOT_SIZE, SLOT_SIZE)
      ctx.drawImage(itemImage, slotPos.x, slotPos.y, SLOT_SIZE, SLOT_SIZE)
    }
  }

  return canvas.toBuffer("image/png")
}
