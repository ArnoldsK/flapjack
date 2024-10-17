import { createCanvas, loadImage } from "canvas"
import { MemberRankData } from "../types/experience"
import {
  getImageAverageColorData,
  getImageDominantColorData,
} from "../utils/color"
import { randomInt } from "../utils/random"
import { clipEllipse } from "../utils/canvas"
import { Unicode } from "../constants"
import { interpolate } from "../utils/number"

const trianglify = require("trianglify")

export const getMemberRankImage = async (
  rankData: MemberRankData,
): Promise<Buffer> => {
  const avatarImageUrl = rankData.member.user.displayAvatarURL({
    extension: "png",
    size: 64,
  })
  const averageColorData = await getImageAverageColorData(avatarImageUrl)
  const dominantColorData = await getImageDominantColorData(avatarImageUrl)
  const isAvatarColorBright = averageColorData.isBright

  // Colors
  const primaryColor = isAvatarColorBright ? "#000" : "#fff"
  const secondaryColor = isAvatarColorBright ? "#fff" : "#000"

  // Sizes
  const [width, height] = [240, 48]
  const margin = 8

  // Canvas
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Background
  trianglify({
    width,
    height,
    xColors: [averageColorData.colorHex, dominantColorData.colorHex],
    cellSize: randomInt(height / 2, height),
    variance: 1,
    colorFunction: isAvatarColorBright
      ? trianglify.colorFunctions.shadows(0.5)
      : trianglify.colorFunctions.sparkle(1),
  }).toCanvas(canvas)

  // Avatar
  const avatarImage = await loadImage(avatarImageUrl)
  const avatarX = margin
  const avatarY = margin
  const avatarWidth = height - margin * 2

  clipEllipse(ctx, avatarX, avatarY, avatarWidth, avatarWidth, (x, y, w, h) => {
    ctx.drawImage(avatarImage, x, y, w, h)
  })

  // Rank and level
  ctx.font = "16px sans-serif"
  ctx.fillStyle = primaryColor
  ctx.textBaseline = "bottom"
  ctx.fillText(
    `#${rankData.rank} ${Unicode.middot} LVL ${rankData.levelData.lvl}`,
    avatarX + avatarWidth + margin,
    height / 2,
  )

  // Percentage
  const percentTextX = avatarX + avatarWidth + margin
  const percentText = `${rankData.levelData.percent}%`

  ctx.font = "bold 16px sans-serif"
  ctx.fillStyle = primaryColor
  ctx.textBaseline = "top"
  ctx.fillText(percentText, percentTextX, height / 2)

  const percentTextMeasure = ctx.measureText(percentText)

  // Bar background
  const barX = percentTextX + percentTextMeasure.width + margin
  const barY = height / 2 + percentTextMeasure.actualBoundingBoxDescent / 2
  const barWidthMax = width - barX - margin
  const barHeight = 3

  ctx.fillStyle = secondaryColor
  ctx.fillRect(barX, barY, barWidthMax, barHeight)

  // Bar foreground
  const { exp, min, max } = rankData.levelData
  const barWidth = interpolate(exp, min, max, 0, barWidthMax)

  ctx.fillStyle = primaryColor
  ctx.fillRect(barX, barY, barWidth, barHeight)

  return canvas.toBuffer()
}
