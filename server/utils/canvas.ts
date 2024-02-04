import type { CanvasRenderingContext2D } from "canvas"

export const clipEllipse = (
  ctx: CanvasRenderingContext2D,
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
