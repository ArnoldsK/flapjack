import { existsSync } from "node:fs"
import path from "node:path"

import { createCanvas, Image, loadImage } from "@napi-rs/canvas"

import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { canvasDrawImage, CanvasDrawImageOptions } from "~/server/utils/canvas"
import { GearSlot } from "~/types/osrs"

type Item = Pick<OsrsItemsEntity, "itemId" | "itemSlot" | "itemName">

interface DrawItem {
  image: Image | undefined
  itemName: string | undefined
  x: number
  y: number
  width: number
  height: number
  options: Required<CanvasDrawImageOptions>
}

// Canvas sizes
const [WIDTH, HEIGHT] = [140, 190]

// Used for layer order
const DRAW_KEYS = [
  "cape",
  "feet",
  "legs",
  "body",
  "neck",
  "avatar",
  "weapon",
  "shield",
] as const

const defaultImageBySlot = new Map<GearSlot, string>([
  [GearSlot.Body, "default-body.gif"],
  [GearSlot.Legs, "default-legs.gif"],
  [GearSlot.Feet, "default-feet.gif"],
])

export const getGearImage = async ({
  avatarUrl,
  items,
}: {
  avatarUrl: string
  items: Item[]
}): Promise<Buffer> => {
  const userItemBySlot = new Map<string, Item>(
    items.map((item) => [item.itemSlot, item]),
  )

  // Canvas
  const canvas = createCanvas(WIDTH, HEIGHT)
  const ctx = canvas.getContext("2d")

  // Use a queue for layering
  const drawQueue = new Map<(typeof DRAW_KEYS)[number], DrawItem>()

  // Avatar
  const avatarImage = await loadImage(avatarUrl)
  const avatarWidth = 50
  const avatarX = WIDTH / 2 - avatarWidth / 2
  const avatarY = 0

  drawQueue.set("avatar", {
    image: avatarImage,
    itemName: undefined,
    x: avatarX,
    y: avatarY,
    width: avatarWidth,
    height: avatarWidth,
    options: {
      ellipse: true,
      mirror: false,
      rotate: 0,
    },
  })

  // Body
  const bodyItem = userItemBySlot.get(GearSlot.Body)
  const bodyWidth = 76
  const bodyHeight = 76
  const bodyX = WIDTH / 2 - bodyWidth / 2
  const bodyY = avatarY + avatarWidth - 20
  drawQueue.set("body", {
    image: await getItemImage(GearSlot.Body, bodyItem?.itemId),
    itemName: bodyItem?.itemName,
    x: bodyX,
    y: bodyY,
    width: bodyWidth,
    height: bodyHeight,
    options: {
      ellipse: false,
      mirror: false,
      rotate: 0,
    },
  })

  // Neck
  const neckItem = userItemBySlot.get(GearSlot.Neck)
  const neckWidth = 40
  const neckHeight = 40
  const neckX = WIDTH / 2 - neckWidth / 2
  const neckY = avatarY + avatarWidth - 20
  drawQueue.set("neck", {
    image: await getItemImage(GearSlot.Neck, neckItem?.itemId),
    itemName: neckItem?.itemName,
    x: neckX,
    y: neckY,
    width: neckWidth,
    height: neckHeight,
    options: {
      ellipse: false,
      mirror: false,
      rotate: 0,
    },
  })

  // Legs
  const legsItem = userItemBySlot.get(GearSlot.Legs)
  const legsWidth = 120
  const legsHeight = 96
  const legsX = WIDTH / 2 - legsWidth / 2
  const legsY = bodyY + bodyHeight - 30
  drawQueue.set("legs", {
    image: await getItemImage(GearSlot.Legs, legsItem?.itemId),
    itemName: legsItem?.itemName,
    x: legsX,
    y: legsY,
    width: legsWidth,
    height: legsHeight,
    options: {
      ellipse: false,
      mirror: false,
      rotate: 0,
    },
  })

  // Feet
  const feetItem = userItemBySlot.get(GearSlot.Feet)
  const feetWidth = 48
  const feetHeight = 48
  const feetX = WIDTH / 2 - feetWidth / 2
  const feetY = legsY + legsHeight - 20
  drawQueue.set("feet", {
    image: await getItemImage(GearSlot.Feet, feetItem?.itemId),
    itemName: feetItem?.itemName,
    x: feetX,
    y: feetY,
    width: feetWidth,
    height: feetHeight,
    options: {
      ellipse: false,
      mirror: false,
      rotate: 0,
    },
  })

  // Cape
  const capeItem = userItemBySlot.get(GearSlot.Cape)
  const capeWidth = 160
  const capeHeight = 160
  const capeX = WIDTH / 2 - capeWidth / 2
  const capeY = avatarY + avatarWidth - 30
  drawQueue.set("cape", {
    image: await getItemImage(GearSlot.Cape, capeItem?.itemId),
    itemName: capeItem?.itemName,
    x: capeX,
    y: capeY,
    width: capeWidth,
    height: capeHeight,
    options: {
      ellipse: false,
      mirror: false,
      rotate: -30,
    },
  })

  // Weapon
  const weaponItem =
    userItemBySlot.get(GearSlot.OneHanded) ??
    userItemBySlot.get(GearSlot.TwoHanded)
  const weaponWidth = 100
  const weaponHeight = 100
  const weaponX = WIDTH / 5 - weaponWidth / 2
  const weaponY = HEIGHT / 3 - weaponHeight / 2

  drawQueue.set("weapon", {
    image: await getItemImage(
      weaponItem?.itemSlot ?? GearSlot.OneHanded,
      weaponItem?.itemId,
    ),
    itemName: weaponItem?.itemName,
    x: weaponX,
    y: weaponY,
    width: weaponWidth,
    height: weaponHeight,
    options: {
      ellipse: false,
      mirror: true,
      rotate: 20,
    },
  })

  // Shield
  const shieldItem = userItemBySlot.get(GearSlot.Shield)
  const shieldWidth = 100
  const shieldHeight = 100
  const shieldX = WIDTH - WIDTH / 5 - shieldWidth / 2
  const shieldY = HEIGHT / 2.3 - shieldHeight / 2
  drawQueue.set("shield", {
    image: await getItemImage(GearSlot.Shield, shieldItem?.itemId),
    itemName: shieldItem?.itemName,
    x: shieldX,
    y: shieldY,
    width: shieldWidth,
    height: shieldHeight,
    options: {
      ellipse: false,
      mirror: false,
      rotate: 0,
    },
  })

  // Draw the queue
  for (const key of DRAW_KEYS) {
    const el = drawQueue.get(key)
    if (!el?.image) continue

    if (el.itemName) {
      mutateDrawItemByName(el.itemName, el)
    }

    canvasDrawImage(ctx, el.image, el.x, el.y, el.width, el.height, el.options)
  }

  return canvas.toBuffer("image/png")
}

const getItemImage = async (slot: GearSlot, itemId: number | undefined) => {
  const defaultImagePath = defaultImageBySlot.get(slot)
  let image: string | undefined

  if (itemId) {
    image = `https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${itemId}`
  } else if (defaultImagePath) {
    image = path.join(__dirname, "assets", defaultImagePath)
    console.log("Gear default image path:", image, existsSync(image))
  }

  if (!image) {
    return
  }

  return await loadImage(image)
}

const mutateDrawItemByName = (name: string, el: DrawItem) => {
  const has = (...needles: string[]) =>
    needles.some((needle) => name.toLowerCase().includes(needle.toLowerCase()))

  if (has(" scimitar")) {
    el.options.rotate = -60
    el.options.mirror = false
  } else if (has(" crossbow")) {
    el.y += 70
    el.options.rotate = -20
    el.options.mirror = false
  } else if (has(" whip")) {
    el.y += 40
    el.options.mirror = false
  } else if (has(" shortbow")) {
    el.y += 30
  } else if (has(" longbow") || has("seercull")) {
    el.y += 30
    el.options.rotate = -70
  } else if (has(" bow")) {
    el.x += 10
    el.y += 30
    el.options.mirror = false
  } else if (has(" claws")) {
    el.x += 20
    el.y += 40
    if (has("Dragon")) {
      el.y += 30
      el.options.rotate = 0
    }
  } else if (has(" greataxe", " maul", " halberd", "tzhaar-ket-om")) {
    el.options.mirror = false
  } else if (has(" bludgeon")) {
    el.width *= 2
    el.height *= 2
    el.x -= 10
    el.y -= 40
    el.options.rotate = -10
  } else if (has(" flower")) {
    el.width *= 0.8
    el.height *= 0.8
    el.x += 10
    el.y += 30
    el.options.mirror = false
  } else if (has("magic shield")) {
    el.options.rotate = 160
  } else if (has("backpack")) {
    el.width *= 0.8
    el.height *= 0.8
    el.x = WIDTH / 2 - el.width / 2
    el.y *= 1.2
    el.y -= 10
  } else if (has(" robe")) {
    el.width *= 1.2
    el.height *= 1.2
    el.x = WIDTH / 2 - el.width / 2
    el.y *= 0.8
  } else if (has(" skirt")) {
    el.height *= 1.2
    el.y *= 0.8
    el.y += 10
  }
}
