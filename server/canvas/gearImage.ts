import { existsSync } from "node:fs"
import path from "node:path"

import { Canvas, createCanvas, Image, loadImage } from "@napi-rs/canvas"

import { appConfig } from "~/server/config"
import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import {
  canvasDrawImage,
  CanvasDrawImageOptions,
  cropImageToContent,
  getSkewRotation,
} from "~/server/utils/canvas"
import { scaleToHeight } from "~/server/utils/number"
import { GearSlot } from "~/types/osrs"

type Item = Pick<OsrsItemsEntity, "itemId" | "itemSlot" | "itemName">

interface DrawItem {
  image: Image | Canvas
  itemName: string | undefined
  x: number
  y: number
  width: number
  height: number
  options: Required<CanvasDrawImageOptions>
}

// Canvas sizes
const BASE_SIZE = [140, 190]
const [WIDTH, HEIGHT] = appConfig.dev
  ? [BASE_SIZE[0] * 3, BASE_SIZE[1] * 3]
  : BASE_SIZE
const ONE_TENTH = HEIGHT / 10
const HEAD_HEIGHT = ONE_TENTH * 2
const BODY_HEIGHT = ONE_TENTH * 2.8
const LEGS_HEIGHT = ONE_TENTH * 3.5
const FEET_HEIGHT = ONE_TENTH * 1.7

// Used for layer order
const DRAW_KEYS = [
  "cape",
  "feet",
  "legs",
  "body",
  "neck",
  "head",
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

  // Head
  const headImage = await loadImage(avatarUrl)
  const headSize = {
    width: HEAD_HEIGHT * 1.1,
    height: HEAD_HEIGHT * 1.1,
  }

  drawQueue.set("head", {
    image: headImage,
    itemName: undefined,
    x: WIDTH / 2 - headSize.width / 2,
    y: 0,
    width: headSize.width,
    height: headSize.height,
    options: {
      ellipse: true,
      mirror: false,
      rotate: 0,
    },
  })

  // Body
  const bodyItem = userItemBySlot.get(GearSlot.Body)
  const bodyImage = await getItemImage(GearSlot.Body, bodyItem?.itemId)

  if (bodyImage) {
    const bodySize = scaleToHeight(
      bodyImage.width,
      bodyImage.height,
      BODY_HEIGHT,
    )

    drawQueue.set("body", {
      image: bodyImage,
      itemName: bodyItem?.itemName,
      x: WIDTH / 2 - bodySize.width / 2,
      y: HEAD_HEIGHT,
      width: bodySize.width,
      height: bodySize.height,
      options: {
        ellipse: false,
        mirror: false,
        rotate: 0,
      },
    })
  }

  // Neck
  const neckItem = userItemBySlot.get(GearSlot.Neck)
  const neckImage = await getItemImage(GearSlot.Neck, neckItem?.itemId)

  if (neckImage) {
    const neckSize = {
      width: 80,
      height: 100,
    }

    drawQueue.set("neck", {
      image: neckImage,
      itemName: neckItem?.itemName,
      x: WIDTH / 2 - neckSize.width / 2,
      y: HEAD_HEIGHT - neckSize.height * 0.4,
      width: neckSize.width,
      height: neckSize.height,
      options: {
        ellipse: false,
        mirror: false,
        rotate: -20,
      },
    })
  }

  // Legs
  const legsItem = userItemBySlot.get(GearSlot.Legs)
  const legsImage = await getItemImage(GearSlot.Legs, legsItem?.itemId)

  if (legsImage) {
    const skewRotation = getSkewRotation(legsImage)
    const legsSize = scaleToHeight(
      legsImage.width,
      legsImage.height,
      LEGS_HEIGHT,
    )

    legsSize.width = Math.max(legsSize.width, WIDTH / 3)

    let rotate = 0
    if (skewRotation === "Clockwise") rotate = -40
    if (skewRotation === "CounterClockwise") rotate = 40

    drawQueue.set("legs", {
      image: legsImage,
      itemName: legsItem?.itemName,
      x: WIDTH / 2 - legsSize.width / 2,
      y: HEAD_HEIGHT + BODY_HEIGHT,
      width: legsSize.width,
      height: legsSize.height,
      options: {
        ellipse: false,
        mirror: false,
        rotate,
      },
    })
  }

  // Feet
  const feetItem = userItemBySlot.get(GearSlot.Feet)
  const feetImage = await getItemImage(GearSlot.Feet, feetItem?.itemId)

  if (feetImage) {
    const feetSize = scaleToHeight(
      feetImage.width,
      feetImage.height,
      FEET_HEIGHT,
    )

    drawQueue.set("feet", {
      image: feetImage,
      itemName: feetItem?.itemName,
      x: WIDTH / 2 - feetSize.width / 2,
      y: HEAD_HEIGHT + BODY_HEIGHT + LEGS_HEIGHT,
      width: feetSize.width,
      height: feetSize.height,
      options: {
        ellipse: false,
        mirror: false,
        rotate: 0,
      },
    })
  }

  // Cape
  const capeItem = userItemBySlot.get(GearSlot.Cape)
  const capeImage = await getItemImage(GearSlot.Cape, capeItem?.itemId)

  if (capeImage) {
    const skewRotation = getSkewRotation(capeImage)

    const capeSize = scaleToHeight(
      capeImage.width,
      capeImage.height,
      BODY_HEIGHT + LEGS_HEIGHT,
    )

    let rotate = 0
    if (skewRotation === "Clockwise") rotate = -30

    drawQueue.set("cape", {
      image: capeImage,
      itemName: capeItem?.itemName,
      x: WIDTH / 2 - capeSize.width / 2,
      y: HEAD_HEIGHT * 0.9,
      width: capeSize.width,
      height: capeSize.height,
      options: {
        ellipse: false,
        mirror: false,
        rotate,
      },
    })
  }

  // Weapon
  const weaponItem =
    userItemBySlot.get(GearSlot.OneHanded) ??
    userItemBySlot.get(GearSlot.TwoHanded)
  const weaponImage = await getItemImage(
    weaponItem?.itemSlot ?? GearSlot.OneHanded,
    weaponItem?.itemId,
  )

  if (weaponImage) {
    const skewRotation = getSkewRotation(weaponImage)

    const weaponSize = scaleToHeight(
      weaponImage.width,
      weaponImage.height,
      ONE_TENTH * 3,
    )

    drawQueue.set("weapon", {
      image: weaponImage,
      itemName: weaponItem?.itemName,
      x: WIDTH / 5 - weaponSize.width / 2,
      y: HEIGHT / 2 - weaponSize.height / 2,
      width: weaponSize.width,
      height: weaponSize.height,
      options: {
        ellipse: false,
        mirror: skewRotation === "Clockwise",
        rotate: 20,
      },
    })
  }

  // Shield
  const shieldItem = userItemBySlot.get(GearSlot.Shield)
  const shieldImage = await getItemImage(GearSlot.Shield, shieldItem?.itemId)

  if (shieldImage) {
    const shieldSize = scaleToHeight(
      shieldImage.width,
      shieldImage.height,
      ONE_TENTH * 3,
    )

    drawQueue.set("shield", {
      image: shieldImage,
      itemName: shieldItem?.itemName,
      x: WIDTH - WIDTH / 5 - shieldSize.width / 2,
      y: HEIGHT / 2 - shieldSize.height / 2,
      width: shieldSize.width,
      height: shieldSize.height,
      options: {
        ellipse: false,
        mirror: true,
        rotate: 45,
      },
    })
  }

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
  const defaultImageName = defaultImageBySlot.get(slot)
  let image: string | undefined

  if (itemId) {
    image = `https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${itemId}`
  } else if (defaultImageName) {
    const defaultImage = path.join("public", "static", "gear", defaultImageName)
    if (existsSync(defaultImage)) {
      image = defaultImage
    }
  }

  if (!image) {
    return
  }

  return cropImageToContent(await loadImage(image))
}

const mutateDrawItemByName = (name: string, el: DrawItem) => {
  const has = (...needles: string[]) =>
    needles.some((needle) => name.toLowerCase().includes(needle.toLowerCase()))

  const recenterWidth = () => (el.x = WIDTH / 2 - el.width / 2)
  const recenterHeight = () => (el.y = HEIGHT / 2 - el.height / 2)

  if (has(" robe")) {
    el.height *= 1.1
  } else if (has(" skirt")) {
    el.y *= 0.95
    el.height *= 1.1
  } else if (has(" scimitar")) {
    el.options.mirror = false
    el.options.rotate = -70
  } else if (has(" longbow")) {
    el.height *= 2
    recenterHeight()
    el.options.rotate = -170
  } else if (has(" shortbow")) {
    el.width *= 0.6
    el.x += WIDTH * 0.1
  } else if (has(" backpack")) {
    el.width *= 0.8
    recenterWidth()
    el.height *= 0.8
    el.y = HEAD_HEIGHT + BODY_HEIGHT / 2 - el.width / 2
    el.options.rotate = -45
  } else if (has(" bludgeon")) {
    el.width *= 2
    recenterWidth()
    el.height *= 2
    recenterHeight()
    el.y -= HEIGHT * 0.1
    el.options.mirror = true
    el.options.rotate = -10
  } else if (has(" dagger")) {
    el.height *= 0.9
    el.options.rotate -= 20
  }
}
