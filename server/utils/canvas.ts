import {
  createCanvas,
  type Canvas,
  type Image,
  type SKRSContext2D,
} from "@napi-rs/canvas"

import { scaleToMax } from "~/server/utils/number"

export interface CanvasDrawImageOptions {
  ellipse?: boolean
  mirror?: boolean
  rotate?: number
}

export const canvasDrawImage = (
  ctx: SKRSContext2D,
  image: Image | Canvas,
  x: number,
  y: number,
  w: number,
  h: number,
  options?: CanvasDrawImageOptions,
) => {
  ctx.save()

  ctx.translate(x + w / 2, y + h / 2)
  if (options?.rotate) {
    ctx.rotate((options.rotate * Math.PI) / 180)
  }
  if (options?.mirror) {
    ctx.scale(-1, 1)
  }
  ctx.translate(-x, -y)

  if (options?.ellipse) {
    ctx.ellipse(x, y, w / 2, h / 2, 0, 0, Math.PI * 2)
    ctx.clip()
  }

  ctx.drawImage(image, -(w / 2) + x, -(h / 2) + y, w, h)

  ctx.restore()
}

export const deg2rad = (deg: number): number => (deg * Math.PI) / 180

export const rad2deg = (rad: number): number => (rad * 180) / Math.PI

/**
 * Adds default font family
 */
export const canvasFont = (input: string) => {
  // Need to specify linux sans serif font due to @napi-rs/canvas issue
  const family = "'DejaVu Sans', sans-serif"

  return `${input} ${family}`
}

/**
 * Important note - due to scaledown, the final crop can be inaccurate
 */
export const cropImageToContent = (image: Image): Canvas => {
  // 1. Scale down dimensions for faster pixel reading
  const scaledDown = scaleToMax(image.width, image.height, 32)
  const scaleFactor = scaledDown.scaleFactor

  const tempCanvas = createCanvas(scaledDown.width, scaledDown.height)
  const tempCtx = tempCanvas.getContext("2d")

  tempCtx.drawImage(image, 0, 0, tempCanvas.width, tempCanvas.height)

  // 2. Scan Pixels
  const imageData = tempCtx.getImageData(
    0,
    0,
    tempCanvas.width,
    tempCanvas.height,
  )
  const data = imageData.data
  const width = imageData.width

  let x1 = Infinity
  let y1 = Infinity
  let x2 = 0
  let y2 = 0

  for (let i = 0; i < data.length; i += 4) {
    const isTransparent = data[i + 3] === 0
    if (isTransparent) continue

    const pixelIndex = i / 4
    const x = pixelIndex % width
    const y = Math.floor(pixelIndex / width)

    x1 = Math.min(x1, x)
    y1 = Math.min(y1, y)
    x2 = Math.max(x2, x)
    y2 = Math.max(y2, y)
  }

  // If x1 is still Infinity, the image is fully transparent
  if (x1 === Infinity) {
    // Return a 1x1 empty canvas
    tempCanvas.width = 1
    tempCanvas.height = 1
    return tempCanvas
  }

  const scaleError = Math.ceil(scaleFactor) + 1

  // 3. Convert Scaled Coordinates back to Original Image Coordinates
  // The dimensions of the cropped area on the ORIGINAL image
  const sourceX = Math.floor(x1 / scaleFactor)
  const sourceY = Math.floor(y1 / scaleFactor) + 1 // +x to fix scale error

  // x2 and y2 are *pixel indices*, so the final dimension needs to be +1
  // (x2 - x1) is the span, add 1 for the width/height of the span
  // (x2 - x1 + 1) / scaleFactor is the width on the original image
  const sourceWidth = Math.ceil((x2 - x1 + 1) / scaleFactor)
  const sourceHeight = Math.ceil((y2 - y1 + 1) / scaleFactor)

  // 4. Create the Final Cropped Canvas
  const finalCanvas = createCanvas(sourceWidth, sourceHeight - scaleError * 2)
  const finalCtx = finalCanvas.getContext("2d")

  // Use the 9-argument drawImage to crop:
  finalCtx.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    -Math.ceil(scaleError / 2),
    sourceWidth,
    sourceHeight,
  )

  return finalCanvas
}

/**
 * This pretty much relies on the image being cropped with `cropImageToContent`
 */
export const getSkewRotation = (
  croppedCanvas: Canvas,
): "CounterClockwise" | "None" | "Clockwise" => {
  const { width, height } = croppedCanvas

  if (width <= 1 || height <= 1) {
    return "None"
  }

  const ctx = croppedCanvas.getContext("2d")
  const imageData = ctx.getImageData(0, 0, width, height)
  const data = imageData.data

  const xTopSolid: number[] = []
  const xBotSolid: number[] = []

  const topRowY = Math.floor(height * 0.1)
  const botRowY = Math.floor(height * 0.9 - 1)
  const topRowStartIndex = Math.floor(topRowY * width * 4)
  const botRowStartIndex = Math.floor(botRowY * width * 4)

  // 1. Get top row solid pixels
  for (let i = topRowStartIndex; i < topRowStartIndex + width * 4; i += 4) {
    if (data[i + 3] === 0) continue
    xTopSolid.push((i - topRowStartIndex) / 4)
  }

  // 2. Get bottom row solid pixels
  for (let i = botRowStartIndex; i < botRowStartIndex + width * 4; i += 4) {
    if (data[i + 3] === 0) continue
    xBotSolid.push((i - botRowStartIndex) / 4)
  }

  // Safety check: if either is -1, the crop failed or the row is empty
  if (xBotSolid.length === 0 || xBotSolid.length === 0) {
    return "None"
  }

  const xTop =
    (Math.min(...xTopSolid) + Math.max(...xTopSolid)) / xTopSolid.length
  const xBot =
    (Math.min(...xBotSolid) + Math.max(...xBotSolid)) / xBotSolid.length

  // 3. Compare Points
  const diff = xTop - xBot

  // Use a small tolerance (e.g., 2 pixels) for 'None' to account for rounding/aliasing
  const tolerance = Math.ceil(width * 0.02)

  if (Math.abs(diff) <= tolerance) {
    // xTop and xBottom are very close
    return "None"
  } else if (diff < 0) {
    // xTop is to the right of xBottom (xTop > xBottom)
    // Example: \
    return "CounterClockwise"
  } else {
    // xTop is to the left of xBottom (xTop < xBottom)
    // Example: /
    return "Clockwise"
  }
}
