import path from "node:path"

import { createCanvas, Image, loadImage } from "@napi-rs/canvas"

import { GearEntity } from "~/server/db/entity/Gear"
import { ItemSlot } from "~/types/osrs"

type Item = Pick<GearEntity, "itemId" | "slot">

interface Position {
  x: number
  y: number
}

const SLOT_SIZE = 32
const SLOT_POSITION = new Map<ItemSlot, Position>([
  [ItemSlot.Head, { x: 58, y: 2 }],
  [ItemSlot.Cape, { x: 17, y: 41 }],
  [ItemSlot.Neck, { x: 58, y: 41 }],
  [ItemSlot.Weapon, { x: 2, y: 80 }],
  [ItemSlot.Weapon, { x: 2, y: 80 }],
  [ItemSlot.Body, { x: 58, y: 80 }],
  [ItemSlot.Shield, { x: 114, y: 80 }],
  [ItemSlot.Legs, { x: 58, y: 120 }],
  [ItemSlot.Hands, { x: 2, y: 160 }],
  [ItemSlot.Feet, { x: 58, y: 160 }],
  [ItemSlot.Ring, { x: 114, y: 160 }],
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

    const imageBySlot = new Map<ItemSlot, Image>(
      await Promise.all(
        items.map(
          async (item) =>
            [
              item.slot,
              await loadImage(
                `https://secure.runescape.com/m=itemdb_oldschool/obj_sprite.gif?id=${item.itemId}`,
              ),
            ] as const,
        ),
      ),
    )

    for (const slot of Object.values(ItemSlot)) {
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
