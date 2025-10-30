import { createCanvas, DOMMatrix } from "@napi-rs/canvas"
import { AttachmentBuilder } from "discord.js"
import GIFEncoder from "gif-encoder-2"

import { canvasFont } from "~/server/utils/canvas"
import { JbCard } from "~/server/utils/jacksbetter"

const CARD_SUIT = new Map<JbCard["suit"], string>([
  ["spades", "♠"],
  ["clubs", "♣"],
  ["hearts", "♥"],
  ["diamonds", "♦"],
])

export const getCardsAttachment = ({
  cards,
  small,
}: {
  cards: Pick<JbCard, "suit" | "value" | "isHeld">[]
  small?: boolean
}): AttachmentBuilder => {
  const hasHeld = cards.some((card) => card.isHeld)

  const sizeMulti = small ? 0.66 : 1
  const headerHeight = hasHeld ? 8 * sizeMulti : 0
  const cardWidth = 45 * sizeMulti
  const cardHeight = 60 * sizeMulti
  const cardRadii = Math.max(8, cardHeight * 0.1)
  const cardPadding = cardWidth * 0.1
  const cardsGap = cardWidth * 0.2
  const frameCount = small ? 1 : 24

  const width = cardWidth * cards.length + cardsGap * (cards.length - 1)
  const height = headerHeight + cardHeight + 1

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  const encoder = new GIFEncoder(width, height, "octree")

  encoder.start()
  encoder.setRepeat(-1)
  encoder.setDelay(20)
  encoder.setQuality(10)
  encoder.setTransparent(0x0_00)

  for (let frame = 0; frame < frameCount; frame++) {
    ctx.clearRect(0, 0, width, height)

    // Calculate the linear progress factor
    const p = frame / (frameCount - 1) || 1

    // Apply the Ease-Out Quad function to the progress factor
    const easedP = -p * (p - 2)

    const y = headerHeight
    for (const [i, card] of cards.entries()) {
      // Card destination X (final position)
      const finalX = (cardWidth + cardsGap) * i

      // Interpolate X based on the eased factor
      const x = finalX * easedP

      const cardX = -cardWidth / 2
      const cardY = -cardHeight / 2

      const rotationRange = 60
      const angle = rotationRange * (1 - easedP)

      // Transform
      ctx.save()

      ctx.setTransform(
        new DOMMatrix()
          .translateSelf(-cardX + x, -cardY + y)
          .rotateSelf(0, angle, 0),
      )

      // Fake shadow
      if (frame < frameCount / 1.5) {
        ctx.fillStyle = "rgba(0, 0, 0, 0.3)"
        ctx.beginPath()
        ctx.roundRect(cardX * 1.2, cardY, cardWidth, cardHeight, cardRadii)
        ctx.fill()
      }

      // Card
      ctx.fillStyle = "#fff"
      ctx.beginPath()
      ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cardRadii)
      ctx.fill()

      // Suit
      ctx.textBaseline = "top"
      ctx.fillStyle = ["hearts", "diamonds"].includes(card.suit)
        ? "#F00"
        : "#111"

      // Value
      const valueSize = cardHeight * 0.5
      ctx.font = canvasFont(valueSize, { bold: true })
      ctx.letterSpacing = `${-valueSize * 0.2}px`
      ctx.fillText(card.value, cardX + cardPadding, cardY + cardPadding)

      const suitSize = cardHeight * 0.5
      ctx.font = canvasFont(suitSize, { family: "" })
      const suit = CARD_SUIT.get(card.suit)!
      const suitMetrics = ctx.measureText(suit)

      ctx.fillText(
        suit,
        cardX + cardWidth - cardPadding - suitMetrics.actualBoundingBoxRight,
        cardY + cardHeight - cardPadding - suitMetrics.actualBoundingBoxDescent,
      )

      ctx.restore()

      // Hold label
      if (frame === frameCount - 1 && hasHeld && card.isHeld) {
        const labelSize = headerHeight
        ctx.fillStyle = "#fff"
        ctx.textBaseline = "top"
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
    }

    encoder.addFrame(ctx)
  }

  encoder.finish()

  return new AttachmentBuilder(
    frameCount > 1 ? encoder.out.getData() : canvas.toBuffer("image/png"),
  ).setName(frameCount > 1 ? "cards.gif" : "cards.png")
}
