import { createCanvas, loadImage } from "@napi-rs/canvas"
import { GuildMember } from "discord.js"
import colorPalette from "get-image-colors"

import { getBackgroundTextColor } from "../utils/color"
import { canvasFont, clipEllipse } from "../utils/canvas"
import chroma from "chroma-js"
import { Unicode } from "../constants"
import { interpolate } from "../utils/number"
import { ExperienceRankData } from "../models/Experience"

export const getRankImage = async (
  rankData: ExperienceRankData,
): Promise<Buffer> => {
  // Avatar data
  const avatarImageUrl = rankData.member.user.displayAvatarURL({
    forceStatic: true,
    extension: "png",
    size: 64,
  })

  // Colors
  const colorData = await colorPalette(avatarImageUrl, {
    type: "image/png",
    count: 1,
  })
  const backgroundColor = colorData[0].hex("rgb")
  const textColor = getBackgroundTextColor(backgroundColor)
  const blendColor = chroma
    .scale([backgroundColor, textColor])
    .mode("lab")
    .colors(1)[0]

  // Sizes
  const [width, height] = [240, 48]
  const margin = 8

  // Canvas
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Background
  ctx.fillStyle = backgroundColor
  ctx.fillRect(0, 0, width, height)

  // Avatar
  const avatarImage = await loadImage(avatarImageUrl)
  const avatarX = margin
  const avatarY = margin
  const avatarWidth = height - margin * 2

  clipEllipse(ctx, avatarX, avatarY, avatarWidth, avatarWidth, (x, y, w, h) => {
    ctx.drawImage(avatarImage, x, y, w, h)
  })

  // Rank and level
  ctx.font = canvasFont("16px")
  ctx.fillStyle = textColor
  ctx.textBaseline = "bottom"
  ctx.fillText(
    `#${rankData.rank} ${Unicode.middot} LVL ${rankData.levelData.lvl}`,
    avatarX + avatarWidth + margin,
    height / 2,
  )

  // Percentage
  const percentTextX = avatarX + avatarWidth + margin
  const percentTextY = height / 2 + margin / 2
  const percentText = `${rankData.levelData.percent}%`

  ctx.font = canvasFont("bold 16px")
  ctx.fillStyle = textColor
  ctx.textBaseline = "top"
  ctx.fillText(percentText, percentTextX, percentTextY)

  const percentTextMeasure = ctx.measureText(percentText)

  // Bar background
  const barX = percentTextX + percentTextMeasure.width + margin
  const barY = percentTextY + percentTextMeasure.actualBoundingBoxDescent / 2
  const barWidthMax = width - barX - margin
  const barHeight = 3

  ctx.fillStyle = blendColor
  ctx.fillRect(barX, barY, barWidthMax, barHeight)

  // Bar foreground
  const { exp, min, max } = rankData.levelData
  const barWidth = interpolate(exp, min, max, 0, barWidthMax)

  ctx.fillStyle = textColor
  ctx.fillRect(barX, barY, barWidth, barHeight)

  return canvas.toBuffer("image/png")
}
