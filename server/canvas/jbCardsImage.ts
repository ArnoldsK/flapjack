import { createCanvas } from "@napi-rs/canvas"

import { canvasFont } from "~/server/utils/canvas"
import { JbCard } from "~/server/utils/jacksbetter"

const CARD_SUIT = new Map<JbCard["suit"], string>([
  ["spades", "♠"],
  ["clubs", "♣"],
  ["hearts", "♥"],
  ["diamonds", "♦"],
])

export const getJbCardsImage = ({
  cards,
  small,
}: {
  cards: JbCard[]
  small?: boolean
}): Buffer => {
  const SIZE_MULTI = small ? 0.66 : 1
  const HEADER_HEIGHT = 8 * SIZE_MULTI
  const CARD_WIDTH = 45 * SIZE_MULTI
  const CARD_HEIGHT = 60 * SIZE_MULTI
  const CARD_RADII = Math.max(8, CARD_HEIGHT * 0.1)
  const CARD_PADDING = CARD_WIDTH * 0.1
  const CARDS_GAP = CARD_WIDTH * 0.2

  const width = CARD_WIDTH * cards.length + CARDS_GAP * (cards.length - 1)
  const height = HEADER_HEIGHT + CARD_HEIGHT + 1

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  let x = 0
  const y = HEADER_HEIGHT
  for (const card of cards) {
    // Value
    ctx.fillStyle = "#fff"

    ctx.arc(0, 0, 20, 0, Math.PI * 2)
    ctx.beginPath()
    ctx.roundRect(x, y, CARD_WIDTH, CARD_HEIGHT, CARD_RADII)
    ctx.fill()

    // Suit
    ctx.textBaseline = "top"
    ctx.fillStyle = ["hearts", "diamonds"].includes(card.suit) ? "#F00" : "#000"

    const valueSize = CARD_HEIGHT * 0.5
    ctx.font = canvasFont(valueSize, { bold: true })
    ctx.letterSpacing = `${-valueSize * 0.2}px`
    ctx.fillText(card.value, x + CARD_PADDING, y + CARD_PADDING)

    const suitSize = CARD_HEIGHT * 0.5
    ctx.font = canvasFont(suitSize, { family: "" })
    const suit = CARD_SUIT.get(card.suit)!
    const suitMetrics = ctx.measureText(suit)

    ctx.fillText(
      suit,
      x + CARD_WIDTH - CARD_PADDING - suitMetrics.actualBoundingBoxRight,
      y + CARD_HEIGHT - CARD_PADDING - suitMetrics.actualBoundingBoxDescent,
    )

    // Hold label
    if (card.isHeld) {
      const labelSize = HEADER_HEIGHT
      ctx.fillStyle = "#fff"
      ctx.letterSpacing = `${labelSize * 0.2}px`
      ctx.font = canvasFont(labelSize, { bold: true })
      const label = "HOLD"
      const labelMetrics = ctx.measureText(label)
      ctx.fillText(
        label,
        x + CARD_WIDTH / 2 - labelMetrics.actualBoundingBoxRight / 2,
        0,
      )
    }

    // Prepare next
    x += CARD_WIDTH + CARDS_GAP
  }

  return canvas.toBuffer("image/png")
}
