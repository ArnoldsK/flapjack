import { createCanvas, loadImage } from "@napi-rs/canvas"
import { HexColorString } from "discord.js"

export interface ColorData {
  R: number
  G: number
  B: number
  color: number
  colorHex: `#${string}`
  isBright: boolean
}

export const parseHexColor = (hex: string): HexColorString | null => {
  if (!hex.startsWith("#")) {
    hex = `#${hex}`
  }

  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    return null
  }

  return hex.toUpperCase() as HexColorString
}

export const rgbToHex = (
  r: number,
  g: number,
  b: number,
  asString: boolean = true,
): number | string => {
  const toHex = (c: number): string => {
    const hex = c.toString(16)

    return hex.length === 1 ? `0${hex}` : hex
  }
  const hexPart = `${toHex(r)}${toHex(g)}${toHex(b)}`

  return asString ? `#${hexPart}` : parseInt(`0x${hexPart}`)
}

export const hexToRgb = (hex: string): number[] => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return [
    result ? parseInt(result[1], 16) : 255,
    result ? parseInt(result[2], 16) : 255,
    result ? parseInt(result[3], 16) : 255,
  ]
}

export const isColorBright = (R: number, G: number, B: number): boolean => {
  return R + G + B > 255 * 1.5
}

/**
 * @deprecated use `get-image-colors`
 */
export const getImageAverageColorData = async (
  imageUrl: string,
): Promise<ColorData> => {
  // Sizes
  const [width, height] = [64, 64]

  // Canvas settings
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Draw image
  const image = await loadImage(imageUrl)

  ctx.drawImage(image, 0, 0, width, height)

  // Get image color data
  let colorCount = 0
  const colorSum = {
    R: 0,
    G: 0,
    B: 0,
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const { data } = ctx.getImageData(x, y, 1, 1)

      colorCount++
      colorSum.R += data[0]
      colorSum.G += data[1]
      colorSum.B += data[2]
    }
  }

  const [R, G, B] = [
    Math.floor(colorSum.R / colorCount),
    Math.floor(colorSum.G / colorCount),
    Math.floor(colorSum.B / colorCount),
  ]

  return {
    R,
    G,
    B,
    color: rgbToHex(R, G, B, false) as number,
    colorHex: rgbToHex(R, G, B) as `#${string}`,
    isBright: isColorBright(R, G, B),
  }
}

export const setColorInteractionId = {
  encode: (hex: string) => {
    hex = parseHexColor(hex)!
    return `set-color-${hex}`
  },
  decode: (customId: string) => {
    return customId.startsWith("set-color-")
      ? parseHexColor(customId.replace("set-color-", ""))
      : null
  },
}

export const labArrayToObject = (
  lab: [number, number, number],
): {
  L: number
  A: number
  B: number
} => {
  return {
    L: lab[0],
    A: lab[1],
    B: lab[2],
  }
}
