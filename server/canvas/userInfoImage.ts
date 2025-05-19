import { createCanvas, loadImage } from "@napi-rs/canvas"
import type { GuildMember } from "discord.js"
import colorPalette from "get-image-colors"

import { canvasFont, clipEllipse } from "~/server/utils/canvas"
import { getBackgroundTextColor } from "~/server/utils/color"
import { getMemberInfo } from "~/server/utils/member"


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

  // Colors
  const colorData = await colorPalette(avatarImageUrl, {
    type: "image/png",
    count: 1,
  })
  const backgroundColor = colorData[0].hex("rgb")
  const textColor = getBackgroundTextColor(backgroundColor)

  // Sizes
  const [width, height] = [300, 115]
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
  const avatarWidth = 64

  clipEllipse(ctx, avatarX, avatarY, avatarWidth, avatarWidth, (x, y, w, h) => {
    ctx.drawImage(avatarImage, x, y, w, h)
  })

  // Position
  ctx.font = canvasFont("bold 26px")
  ctx.fillStyle = textColor
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

  ctx.font = canvasFont("bold 11px")
  ctx.fillStyle = textColor
  ctx.textBaseline = "top"
  ctx.textAlign = "left"
  ctx.fillText(`On Discord since`, createdX, createdY)

  ctx.font = canvasFont("13px")
  ctx.fillText(info.createdDate, createdX, createdY + 14)

  // Joined since
  const joinedX = createdX
  const joinedY = createdY + 27 + margin

  ctx.font = canvasFont("bold 11px")
  ctx.fillStyle = textColor
  ctx.textBaseline = "top"
  ctx.textAlign = "left"
  ctx.fillText(`On ${member.guild.name} since`, joinedX, joinedY)
  ctx.font = canvasFont("13px")
  ctx.fillText(info.joinedDate, joinedX, joinedY + 14)

  // Joined ago
  const agoX = createdX
  const agoY = joinedY + 27 + margin

  ctx.font = canvasFont("bold 11px")
  ctx.fillStyle = textColor
  ctx.textBaseline = "top"
  ctx.textAlign = "left"
  ctx.fillText(`Joined`, agoX, agoY)
  ctx.font = canvasFont("13px")
  ctx.fillText(info.joinedAgo, agoX, agoY + 14)

  return canvas.toBuffer("image/png")
}
