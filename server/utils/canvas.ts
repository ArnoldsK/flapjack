import path from "node:path"

import {
  GlobalFonts,
  type Canvas,
  type Image,
  type SKRSContext2D,
} from "@napi-rs/canvas"

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
 * Register global fonts
 */
export const registerGlobalFonts = () => {
  if (GlobalFonts.has("Roboto")) return

  for (const fontPath of [
    path.join("public", "font", "roboto.bold.ttf"),
    path.join("public", "font", "roboto.bold-italic.ttf"),
    path.join("public", "font", "roboto.italic.ttf"),
    path.join("public", "font", "roboto.regular.ttf"),
  ]) {
    GlobalFonts.registerFromPath(fontPath, "Roboto")
  }
}

/**
 * Adds default font family
 */
export const canvasFont = (
  size: number,
  options?: { bold?: boolean; family?: string },
) => {
  registerGlobalFonts()

  const bold = options?.bold ? "bold" : ""
  const family = options?.family ?? "'Roboto', sans-serif"

  return `${bold} ${size} ${family}`.trim()
}
