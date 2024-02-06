import { createCanvas, loadImage } from "canvas"
import type { GuildMember } from "discord.js"

import {
  getImageAverageColorData,
  getImageDominantColorData,
} from "../utils/color"
import { clipEllipse } from "../utils/canvas"
import { randomInt } from "../utils/random"
import { getMemberInfo } from "../utils/member"

const trianglify = require("trianglify")

export const getUserInfoImage = async (
  member: GuildMember,
): Promise<Buffer> => {
  const info = await getMemberInfo(member)

  // Avatar data
  const avatarImageUrl = member.user.displayAvatarURL({
    forceStatic: true,
    extension: "png",
    size: 64,
  })
  const averageColorData = await getImageAverageColorData(avatarImageUrl)
  const dominantColorData = await getImageDominantColorData(avatarImageUrl)
  const isAvatarColorBright = averageColorData.isBright

  // Colors
  const primaryColor = isAvatarColorBright ? "#000" : "#fff"

  // Sizes
  const [width, height] = [300, 120]
  const margin = 8

  // Canvas
  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Background
  trianglify({
    width,
    height,
    xColors: [averageColorData.colorHex, dominantColorData.colorHex],
    cellSize: randomInt(height / 3, height / 2),
    variance: 1,
    colorFunction: isAvatarColorBright
      ? trianglify.colorFunctions.shadows(0.5)
      : trianglify.colorFunctions.sparkle(1),
  }).toCanvas(canvas)

  // Avatar
  const avatarImage = await loadImage(avatarImageUrl)
  const avatarX = margin
  const avatarY = margin
  const avatarWidth = 64

  clipEllipse(ctx, avatarX, avatarY, avatarWidth, avatarWidth, (x, y, w, h) => {
    ctx.drawImage(avatarImage, x, y, w, h)
  })

  // Position
  ctx.font = "bold 26px sans-serif"
  ctx.fillStyle = primaryColor
  ctx.textBaseline = "top"
  ctx.textAlign = "center"
  ctx.fillText(
    `#${info.position}`,
    (margin * 2 + avatarWidth) / 2,
    avatarY + avatarWidth + margin,
    avatarWidth,
  )

  // Created
  const createdX = avatarX + avatarWidth + margin
  const createdY = margin

  ctx.font = "bold 11px sans-serif"
  ctx.fillStyle = primaryColor
  ctx.textBaseline = "top"
  ctx.textAlign = "left"
  ctx.fillText(`On Discord since`, createdX, createdY)

  ctx.font = "13px sans-serif"
  ctx.fillText(info.createdDate, createdX, createdY + 14)

  // Joined since
  const joinedX = createdX
  const joinedY = createdY + 27 + margin

  ctx.font = "bold 11px sans-serif"
  ctx.fillStyle = primaryColor
  ctx.textBaseline = "top"
  ctx.textAlign = "left"
  ctx.fillText(`On ${member.guild.name} since`, joinedX, joinedY)
  ctx.font = "13px sans-serif"
  ctx.fillText(info.joinedDate, joinedX, joinedY + 14)

  // Joined ago
  const agoX = createdX
  const agoY = joinedY + 27 + margin

  ctx.font = "bold 11px sans-serif"
  ctx.fillStyle = primaryColor
  ctx.textBaseline = "top"
  ctx.textAlign = "left"
  ctx.fillText(`Joined`, agoX, agoY)
  ctx.font = "13px sans-serif"
  ctx.fillText(info.joinedAgo, agoX, agoY + 14)

  return canvas.toBuffer()
}
