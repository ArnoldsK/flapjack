import { createCanvas } from "@napi-rs/canvas"

import { canvasFont } from "~/server/utils/canvas"
import { JbCard } from "~/server/utils/jacksbetter"

const CARD_SUIT = new Map<JbCard["suit"], string>([
  ["spades", "♠"],
  ["clubs", "♣"],
  ["hearts", "♥"],
  ["diamonds", "♦"],
])

export const getCardsImage = ({
  cards,
  small,
}: {
  cards: Pick<JbCard, "suit" | "value" | "isHeld">[]
  small?: boolean
}): Buffer => {
  const hasHeld = cards.some((card) => card.isHeld)

  const sizeMulti = small ? 0.66 : 1
  const headerHeight = hasHeld ? 8 * sizeMulti : 0
  const cardWidth = 45 * sizeMulti
  const cardHeight = 60 * sizeMulti
  const cardRadii = Math.max(8, cardHeight * 0.1)
  const cardPadding = cardWidth * 0.1
  const cardsGap = cardWidth * 0.2

  const width = cardWidth * cards.length + cardsGap * (cards.length - 1)
  const height = headerHeight + cardHeight + 1

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  let x = 0
  const y = headerHeight
  for (const card of cards) {
    // Value
    ctx.fillStyle = "#fff"

    ctx.arc(0, 0, 20, 0, Math.PI * 2)
    ctx.beginPath()
    ctx.roundRect(x, y, cardWidth, cardHeight, cardRadii)
    ctx.fill()

    // Suit
    ctx.textBaseline = "top"
    ctx.fillStyle = ["hearts", "diamonds"].includes(card.suit) ? "#F00" : "#000"

    const valueSize = cardHeight * 0.5
    ctx.font = canvasFont(valueSize, { bold: true })
    ctx.letterSpacing = `${-valueSize * 0.2}px`
    ctx.fillText(card.value, x + cardPadding, y + cardPadding)

    const suitSize = cardHeight * 0.5
    ctx.font = canvasFont(suitSize, { family: "" })
    const suit = CARD_SUIT.get(card.suit)!
    const suitMetrics = ctx.measureText(suit)

    ctx.fillText(
      suit,
      x + cardWidth - cardPadding - suitMetrics.actualBoundingBoxRight,
      y + cardHeight - cardPadding - suitMetrics.actualBoundingBoxDescent,
    )

    // Hold label
    if (hasHeld && card.isHeld) {
      const labelSize = headerHeight
      ctx.fillStyle = "#fff"
      ctx.letterSpacing = `${labelSize * 0.2}px`
      ctx.font = canvasFont(labelSize, { bold: true })
      const label = "HOLD"
      const labelMetrics = ctx.measureText(label)
      ctx.fillText(
        label,
        x + cardWidth / 2 - labelMetrics.actualBoundingBoxRight / 2,
        0,
      )
    }

    // Prepare next
    x += cardWidth + cardsGap
  }

  return canvas.toBuffer("image/png")
}
