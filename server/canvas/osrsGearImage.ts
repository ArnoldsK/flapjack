import { createCanvas, Image, loadImage } from "@napi-rs/canvas"

import { appConfig } from "~/server/config"
import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { canvasDrawImage, CanvasDrawImageOptions } from "~/server/utils/canvas"
import { OsrsItemSlot } from "~/types/osrs"

// Used for layer order
const drawKeys = [
  "cape",
  "body",
  "neck",
  "feet",
  "legs",
  "avatar",
  "weapon",
  "shield",
] as const

const defaultImagePathBySlot = new Map<OsrsItemSlot, string>([
  [OsrsItemSlot.Body, "/static/osrs/default-body.gif"],
  [OsrsItemSlot.Legs, "/static/osrs/default-legs.gif"],
])

// TODO: Default getup without images? Full body base sprite?
// TODO: Use self hosting for used images
export const getOsrsGearImage = async ({
  avatarUrl,
  userItems,
}: {
  avatarUrl: string
  userItems: OsrsItemsEntity[]
}): Promise<Buffer> => {
  const userItemBySlot = new Map<string, OsrsItemsEntity>(
    userItems.map((item) => [item.itemSlot, item]),
  )

  // Sizes
  const [width, height] = [140, 230]

  // Canvas
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // // Background
  // ctx.fillStyle = "#222"
  // ctx.fillRect(0, 0, width, height)

  // Use a queue for layering
  const drawQueue = new Map<
    (typeof drawKeys)[number],
    {
      props: [Image, number, number, number, number]
      options?: CanvasDrawImageOptions
    }
  >()

  // Avatar
  const avatarImage = await loadImage(avatarUrl)
  const avatarWidth = 50
  const avatarX = width / 2 - avatarWidth / 2
  const avatarY = 20

  drawQueue.set("avatar", {
    props: [avatarImage, avatarX, avatarY, avatarWidth, avatarWidth],
    options: {
      ellipse: true,
    },
  })

  // Body
  const bodyItem = userItemBySlot.get(OsrsItemSlot.Body)
  const bodyWidth = 76
  const bodyHeight = 76
  const bodyX = width / 2 - bodyWidth / 2
  const bodyY = avatarY + avatarWidth - 20
  const bodyImage = await getItemImage(OsrsItemSlot.Body, bodyItem)
  if (bodyImage) {
    drawQueue.set("body", {
      props: [bodyImage, bodyX, bodyY, bodyWidth, bodyHeight],
    })
  }

  // Neck
  const neckItem = userItemBySlot.get(OsrsItemSlot.Neck)
  const neckWidth = 40
  const neckHeight = 40
  const neckX = width / 2 - neckWidth / 2
  const neckY = avatarY + avatarWidth - 20
  const neckImage = await getItemImage(OsrsItemSlot.Neck, neckItem)
  if (neckImage) {
    drawQueue.set("neck", {
      props: [neckImage, neckX, neckY, neckWidth, neckHeight],
    })
  }

  // Legs
  const legsItem = userItemBySlot.get(OsrsItemSlot.Legs)
  const legsWidth = 120
  const legsHeight = 96
  const legsX = width / 2 - legsWidth / 2
  const legsY = bodyY + bodyHeight - 30
  const legsImage = await getItemImage(OsrsItemSlot.Legs, legsItem)
  if (legsImage) {
    drawQueue.set("legs", {
      props: [legsImage, legsX, legsY, legsWidth, legsHeight],
    })
  }

  // Feet
  const feetItem = userItemBySlot.get(OsrsItemSlot.Feet)
  const feetWidth = 48
  const feetHeight = 48
  const feetX = width / 2 - feetWidth / 2
  const feetY = legsY + legsHeight - 20
  const feetImage = await getItemImage(OsrsItemSlot.Feet, feetItem)
  if (feetImage) {
    drawQueue.set("feet", {
      props: [feetImage, feetX, feetY, feetWidth, feetHeight],
    })
  }

  // Cape
  const capeItem = userItemBySlot.get(OsrsItemSlot.Cape)
  const capeWidth = 160
  const capeHeight = 160
  const capeX = width / 2 - capeWidth / 2
  const capeY = avatarY + avatarWidth - 30
  const capeImage = await getItemImage(OsrsItemSlot.Cape, capeItem)
  if (capeImage) {
    drawQueue.set("cape", {
      props: [capeImage, capeX, capeY, capeWidth, capeHeight],
      options: {
        rotate: -30,
      },
    })
  }

  // Weapon
  const weaponItem = userItems.find((el) =>
    [OsrsItemSlot.OneHanded, OsrsItemSlot.TwoHanded].includes(el.itemSlot),
  )
  let weaponWidth = 100
  let weaponHeight = 100
  let weaponX = width / 5 - weaponWidth / 2
  let weaponY = height / 3 - weaponHeight / 2

  const weaponDrawOptions: CanvasDrawImageOptions = {
    rotate: 20,
    mirror: true,
  }

  if (!weaponItem) {
    // Check once
  } else if (weaponItem.itemName.includes(" scimitar")) {
    weaponDrawOptions.rotate = -60
    weaponDrawOptions.mirror = false
  } else if (weaponItem.itemName.includes(" crossbow")) {
    weaponY += 70
    weaponDrawOptions.rotate = -20
    weaponDrawOptions.mirror = false
  } else if (weaponItem.itemName.includes(" whip")) {
    weaponY += 40
    weaponDrawOptions.mirror = false
  } else if (weaponItem.itemName.includes(" shortbow")) {
    weaponY += 30
  } else if (
    weaponItem.itemName.includes(" longbow") ||
    weaponItem.itemName.includes("Seercull")
  ) {
    weaponY += 30
    weaponDrawOptions.rotate = -70
  } else if (weaponItem.itemName.includes(" bow")) {
    weaponX += 10
    weaponY += 30
    weaponDrawOptions.mirror = false
  } else if (weaponItem.itemName.includes(" claws")) {
    weaponX += 20
    weaponY += 40
    if (weaponItem.itemName.includes("Dragon")) {
      weaponY += 30
      weaponDrawOptions.rotate = 0
    }
  } else if (
    weaponItem.itemName.includes(" greataxe") ||
    weaponItem.itemName.includes(" maul") ||
    weaponItem.itemName.includes(" halberd") ||
    weaponItem.itemName.includes("Tzhaar-ket-om")
  ) {
    weaponDrawOptions.mirror = false
  } else if (weaponItem.itemName.includes(" bludgeon")) {
    weaponWidth *= 2
    weaponHeight *= 2
    weaponX -= 10
    weaponY -= 40
    weaponDrawOptions.rotate = -10
  }

  const weaponImage = await getItemImage(OsrsItemSlot.OneHanded, weaponItem)
  if (weaponImage) {
    drawQueue.set("weapon", {
      props: [weaponImage, weaponX, weaponY, weaponWidth, weaponHeight],
      options: weaponDrawOptions,
    })
  }

  // Shield
  const shieldItem = userItemBySlot.get(OsrsItemSlot.Shield)
  const shieldWidth = 100
  const shieldHeight = 100
  const shieldX = width - width / 5 - shieldWidth / 2
  const shieldY = height / 2.3 - shieldHeight / 2
  const shieldImage = await getItemImage(OsrsItemSlot.Shield, shieldItem)
  if (shieldImage) {
    drawQueue.set("shield", {
      props: [shieldImage, shieldX, shieldY, shieldWidth, shieldHeight],
    })
  }

  // Draw the queue
  for (const key of drawKeys) {
    const item = drawQueue.get(key)
    if (!item) continue

    canvasDrawImage(ctx, ...item.props, item.options)
  }

  // await writeFile(
  //   "osrs-gear.png",
  //   canvas.toBuffer("image/png") as unknown as string,
  // )

  return canvas.toBuffer("image/png")
}

const getItemImage = async (
  slot: OsrsItemSlot,
  item: OsrsItemsEntity | undefined,
) => {
  const defaultImagePath = defaultImagePathBySlot.get(slot)
  let imageUrl: string | null = null

  if (item) {
    imageUrl = `https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${item.itemId}`
  } else if (defaultImagePath) {
    imageUrl = new URL(defaultImagePath, appConfig.web.baseUrl).toString()
  }

  if (!imageUrl) {
    return null
  }

  return await loadImage(imageUrl)
}
