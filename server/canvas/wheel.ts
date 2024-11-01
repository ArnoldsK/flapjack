import GIFEncoder from "gif-encoder-2"
import { createCanvas, SKRSContext2D } from "@napi-rs/canvas"
import { canvasFont, deg2rad } from "../utils/canvas"
import { randomInt } from "../utils/random"
import { interpolate } from "../utils/number"

const WHEEL_SIZE = 800
const WHEEL_COLORS = {
  background: "#313338",
  white: "#fff",
  primary: "#2B2D31",
  accent: "#1E1F22",
  muted: "#949BA4",
}

const SPIN_DELAY = Math.ceil(1_000 / 30)
const SPIN_DURATION = 2_000
const spinDegMaxStep = 30
const SPIN_COUNT = Math.ceil(SPIN_DURATION / SPIN_DELAY)

export const getWheelImage = async (items: string[]): Promise<Buffer> => {
  // Setup canvas
  const canvas = createCanvas(WHEEL_SIZE, WHEEL_SIZE)
  const ctx = canvas.getContext("2d")

  // Setup encoder
  const encoder = new GIFEncoder(WHEEL_SIZE, WHEEL_SIZE, "neuquant", true)
  encoder.setDelay(SPIN_DELAY)
  encoder.setRepeat(-1)
  encoder.start()

  // Add frames
  let spinDeg = randomInt(0, 359)
  for (let spin = 0; spin < SPIN_COUNT; spin++) {
    drawWheel(ctx, {
      // Replace first frame items with empty text for Discord out of focus view
      items: spin === 0 ? items.map(() => "") : items,
      radSpinOffset: deg2rad(spinDeg),
    })
    encoder.addFrame(ctx as any)

    const spinDegStep = interpolate(spin, SPIN_COUNT, 0, 0, spinDegMaxStep)
    spinDeg = (spinDeg + spinDegStep) % 360
  }

  // Output buffer
  encoder.finish()
  return encoder.out.getData()
}

const drawSegment = (
  ctx: SKRSContext2D,
  {
    radius,
    sliceRad,
    radSpinOffset,
    index,
    text,
  }: {
    radius: number
    /**
     * RAD of a single segment slice
     */
    sliceRad: number
    /**
     * RAD to rotate the slice
     */
    radSpinOffset: number
    index: number
    text: string
  },
) => {
  ctx.save()

  // Options
  const halfRad = sliceRad / 2
  const segmentStartRad = sliceRad * index
  const segmentEndRad = segmentStartRad + sliceRad
  const textOuterMargin = radius * 0.05
  const textInnerMargin = radius * 0.3
  const isActive =
    radSpinOffset >= segmentStartRad && radSpinOffset < segmentEndRad

  // Move 0;0 to the center
  ctx.translate(WHEEL_SIZE / 2, WHEEL_SIZE / 2)

  // Rotate the slice to match the index
  // Offset the angle so the base position is "straight right"
  // ctx.rotate(segmentStartRad - halfRad + radSpinOffset)
  ctx.rotate(segmentStartRad - radSpinOffset)

  // Draw the slice
  ctx.fillStyle = WHEEL_COLORS.primary
  ctx.strokeStyle = WHEEL_COLORS.accent
  ctx.lineWidth = WHEEL_SIZE * 0.01

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(radius, 0)
  ctx.arc(0, 0, radius, 0, sliceRad)
  ctx.closePath()
  ctx.fill()
  ctx.stroke()

  // Rotate text to be aligned to the center of the slice
  ctx.rotate(halfRad)

  // Draw text
  ctx.textAlign = "right"
  ctx.textBaseline = "middle"
  ctx.fillStyle = isActive ? WHEEL_COLORS.white : WHEEL_COLORS.muted

  ctx.font = canvasFont("1px")
  const textSize = ctx.measureText(text)
  const textHeight =
    textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent
  const textWidth = Math.max(textSize.width, textHeight)
  const fontSize = Math.floor(
    (radius - textInnerMargin - textOuterMargin) / textWidth,
  )
  ctx.font = canvasFont(`${fontSize}px`)

  ctx.fillText(text, radius - textOuterMargin, 0)

  ctx.restore()
}

const drawArrow = (ctx: SKRSContext2D) => {
  ctx.save()

  const arrowSize = WHEEL_SIZE * 0.07

  ctx.translate(WHEEL_SIZE - arrowSize, WHEEL_SIZE / 2)

  ctx.fillStyle = WHEEL_COLORS.white

  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(arrowSize, -arrowSize / 2)
  ctx.lineTo(arrowSize, arrowSize / 2)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

const drawWheel = (
  ctx: SKRSContext2D,
  {
    items,
    radSpinOffset,
  }: {
    items: string[]
    radSpinOffset: number
  },
) => {
  ctx.fillStyle = WHEEL_COLORS.background
  ctx.fillRect(0, 0, WHEEL_SIZE, WHEEL_SIZE)

  for (const [index, item] of items.entries()) {
    drawSegment(ctx, {
      sliceRad: (2 * Math.PI) / items.length,
      radius: WHEEL_SIZE / 2 - WHEEL_SIZE * 0.05,
      radSpinOffset,
      index,
      text: item,
    })
  }

  drawArrow(ctx)
}
