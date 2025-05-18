import { MouseEvent, useCallback, useEffect, useMemo, useState } from "react"
import Image from "next/image"
import { useWindowSize } from "react-use"

import * as S from "./styles"
import { randomValue } from "~/server/utils/random"
import { interpolate } from "~/server/utils/number"

interface AvatarGridBannerProps {
  avatarUrls: string[]
}

export const AvatarGridBanner = ({ avatarUrls }: AvatarGridBannerProps) => {
  // #############################################################################
  // Layout
  // #############################################################################
  const windowSize = useWindowSize()

  const gridItemCount = useMemo(() => {
    // Want to fill items 60% of height, give or take
    const rows = Math.ceil((windowSize.height * 0.6) / S.GRID_ITEM_SIZE)
    // Must fit items the whole width, and allow 1 extra on each side
    const cols = Math.ceil(windowSize.width / S.GRID_ITEM_SIZE) + 2

    return { cols, rows }
  }, [windowSize])

  // #############################################################################
  // Group avatars into a grid
  // #############################################################################
  const [grid, setGrid] = useState<string[][]>([])

  useEffect(() => {
    const rows: string[][] = []

    for (let row = 0; row < gridItemCount.rows; row++) {
      const columns: string[] = []

      for (let col = 0; col < gridItemCount.cols; col++) {
        const avatarUrl = randomValue(avatarUrls)!

        columns.push(avatarUrl)
      }

      rows.push(columns)
    }

    setGrid(rows)
  }, [avatarUrls, gridItemCount.cols, gridItemCount.rows])

  // #############################################################################
  // Fun zone
  // #############################################################################
  const onMouseMove = useCallback((ev: MouseEvent) => {
    const el = ev.target as HTMLElement | undefined
    if (!el) return

    const imgEl = el.querySelector("img") as HTMLImageElement | undefined
    if (!imgEl) return

    const rect = el.getBoundingClientRect()

    const degAbs = 20

    const degY = interpolate(
      ev.nativeEvent.offsetX,
      0,
      rect.width,
      -degAbs,
      degAbs,
    )
    const degX = interpolate(
      ev.nativeEvent.offsetY,
      0,
      rect.height,
      degAbs,
      -degAbs,
    )
    const brightness = interpolate(
      ev.nativeEvent.offsetY,
      0,
      rect.height,
      1.2,
      0.8,
    )

    imgEl.style.transform = `rotateX(${degX}deg) rotateY(${degY}deg)`
    imgEl.style.filter = `brightness(${brightness})`
  }, [])

  // #############################################################################
  // Render
  // #############################################################################
  if (!avatarUrls.length) {
    return null
  }

  return (
    <S.Wrap>
      <S.RadialGradient />
      <S.GradientTop />
      <S.GradientBottom />
      {grid.map((cols, row) => (
        <S.ImageGridRow key={row}>
          {cols.map((url, col) => (
            <S.GridItem key={col} onMouseMove={onMouseMove}>
              <Image src={url} alt="" fill sizes="100%" />
            </S.GridItem>
          ))}
        </S.ImageGridRow>
      ))}
    </S.Wrap>
  )
}
