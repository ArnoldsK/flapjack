import { createCanvas, loadImage } from "@napi-rs/canvas"

import { DISCORD_BACKGROUND_COLOR_HEX } from "~/constants"
import { canvasFont, clipEllipse } from "~/server/utils/canvas"

export const getUserColorPreviewImage = async ({
  avatarUrl,
  displayName,
  hexColors,
}: {
  avatarUrl: string
  displayName: string
  hexColors: string[]
}): Promise<Buffer> => {
  // Vars
  const sectionAvatarSize = 40
  const sectionPadding = 10
  const sectionHeight = sectionAvatarSize + sectionPadding * 2
  const height = sectionHeight * hexColors.length
  const width = 300

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  // Bg
  ctx.fillStyle = DISCORD_BACKGROUND_COLOR_HEX
  ctx.fillRect(0, 0, width, height)

  // Avatar
  const avatarImage = await loadImage(avatarUrl)

  for (const [i, hexColor] of hexColors.entries()) {
    // Avatar
    clipEllipse(
      ctx,
      sectionPadding,
      sectionHeight * i + sectionPadding,
      sectionAvatarSize,
      sectionAvatarSize,
      (x, y, w, h) => {
        ctx.drawImage(avatarImage, x, y, w, h)
      },
    )

    // Name
    ctx.fillStyle = hexColor
    ctx.textAlign = "left"
    ctx.textBaseline = "middle"
    ctx.font = canvasFont("16px")
    ctx.fillText(
      `${displayName} #${i + 1}`,
      sectionPadding + sectionAvatarSize + 14,
      sectionHeight * i + sectionHeight / 2,
    )
  }

  return canvas.toBuffer("image/png")
}
