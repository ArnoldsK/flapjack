import type { SKRSContext2D } from "@napi-rs/canvas"

export const clipEllipse = (
  ctx: SKRSContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  draw: (x: number, y: number, w: number, h: number) => void,
) => {
  ctx.save()
  ctx.ellipse(x + w / 2, y + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2)
  ctx.clip()
  draw(x, y, w, h)
  ctx.restore()
}

export const deg2rad = (deg: number): number => (deg * Math.PI) / 180

export const rad2deg = (rad: number): number => (rad * 180) / Math.PI
