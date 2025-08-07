import chroma from "chroma-js"
import { HexColorString } from "discord.js"

export const parseHexColor = (hex: string): HexColorString | null => {
  if (!hex.startsWith("#")) {
    hex = `#${hex}`
  }

  if (!/^#[0-9A-F]{6}$/i.test(hex)) {
    return null
  }

  return hex.toUpperCase() as HexColorString
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

/**
 * @see https://runkit.com/vickychijwani/chroma-contrasting-text
 */
export const getBackgroundTextColor = (hex: string) => {
  const MIN_CONTRAST_RATIO = 7
  const WHITE = chroma("white")
  const BLACK = chroma("black")

  const bg = chroma(hex)
  let text = null

  do {
    const contrastWithWhite = chroma.contrast(bg, WHITE)
    const contrastWithBlack = chroma.contrast(bg, BLACK)

    if (contrastWithWhite >= MIN_CONTRAST_RATIO) {
      text = WHITE
    } else if (contrastWithBlack >= MIN_CONTRAST_RATIO) {
      text = BLACK
    }
  } while (text === null)

  return text.hex("rgb")
}

export const hexToDecimal = (hex: string): number => {
  return Number.parseInt(hex.replace("#", ""), 16)
}
