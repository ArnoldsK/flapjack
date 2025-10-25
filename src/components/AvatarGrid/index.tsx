import Image from "next/image"
import { MouseEvent, useCallback, useMemo, useState } from "react"
import { useDebounce, useTimeoutFn, useWindowSize } from "react-use"

import * as S from "./styles"

import { range } from "~/server/utils/number"
import { randomInt, randomValue } from "~/server/utils/random"

interface AvatarGridProps {
  avatarUrls: string[]
}

interface GridItemAvatar {
  url: string
  x: number
  y: number
}

interface GridItem {
  id: string
  xPercent: number
  yPercent: number
  avatar: GridItemAvatar
  url: string | null
}

const getItemCount = (base: number) => {
  const count = Math.ceil(base / S.GRID_ITEM_SIZE)
  // Ensure it's NOT divisible by two
  // This is done because the middle one will always be the center one
  // So we can remove one and divide the remaining for both sides
  return count % 2 === 0 ? count + 1 : count
}

const getItemId = (x: number, y: number): string => {
  return `${S.GRID_ITEM_CLASS_NAME}-${x}-${y}`
}

const getAvatarPosition = (): number => {
  const margin = S.AVATAR_SIZE * 0.1
  return randomInt(margin, S.GRID_ITEM_SIZE - S.AVATAR_SIZE - margin)
}

export const AvatarGrid = ({ avatarUrls }: AvatarGridProps) => {
  // #############################################################################
  // Layout
  // #############################################################################
  const windowSize = useWindowSize()

  const gridItemCount = useMemo(() => {
    return {
      rows: getItemCount(windowSize.width),
      cols: getItemCount(windowSize.height),
    }
  }, [windowSize.height, windowSize.width])

  // #############################################################################
  // Create grid items
  // #############################################################################
  const [items, setItems] = useState<GridItem[]>([])

  const getAvatarItemUrl = (avatarUrl: string): string | null => {
    // Jobans
    if (/avatars\/(146366893161316352|133300733033447424)/.test(avatarUrl)) {
      return "https://jobans.lv"
    }

    return null
  }

  const handleSetItems = useCallback(() => {
    const centerSegmentPosX = windowSize.width / 2
    const centerSegmentPosY = windowSize.height / 2
    const absX = (gridItemCount.rows - 1) / 2
    const absY = (gridItemCount.cols - 1) / 2

    setItems((currentItems) => {
      const newItems: GridItem[] = []

      for (let x = -absX; x <= absX; x++) {
        for (let y = -absY; y <= absY; y++) {
          // Ignore center item
          if (x === 0 && y === 0) continue

          const id = getItemId(x, y)
          const currentItem = currentItems.find((item) => item.id === id)

          const posX = centerSegmentPosX + x * S.GRID_ITEM_SIZE
          const posY = centerSegmentPosY + y * S.GRID_ITEM_SIZE
          const xPercent = (posX / windowSize.width) * 100
          const yPercent = (posY / windowSize.height) * 100

          // Add existing as is
          if (currentItem) {
            newItems.push({
              ...currentItem,
              xPercent,
              yPercent,
            })
            continue
          }

          const avatarUrl = randomValue(avatarUrls)!
          const url = getAvatarItemUrl(avatarUrl)

          newItems.push({
            id,
            xPercent,
            yPercent,
            avatar: {
              url: avatarUrl,
              x: getAvatarPosition(),
              y: getAvatarPosition(),
            },
            url,
          })
        }
      }

      return newItems
    })
  }, [
    avatarUrls,
    gridItemCount.cols,
    gridItemCount.rows,
    windowSize.height,
    windowSize.width,
  ])

  useDebounce(handleSetItems, 100, [windowSize])

  // #############################################################################
  // Fun zone
  // #############################################################################
  const onMouseMove = useCallback((ev: MouseEvent) => {
    const el = ev.target as HTMLElement | undefined
    if (!el) return

    const imgEl = el.querySelector("img") as HTMLImageElement | undefined
    if (!imgEl) return

    const rect = el.getBoundingClientRect()

    const degAbs = 25

    const degY = range(ev.nativeEvent.offsetX, 0, rect.width, -degAbs, degAbs)
    const degX = range(ev.nativeEvent.offsetY, 0, rect.height, degAbs, -degAbs)
    const brightness = range(ev.nativeEvent.offsetY, 0, rect.height, 1.2, 0.8)

    imgEl.style.transform = `rotateX(${degX}deg) rotateY(${degY}deg) scale(1.1)`
    imgEl.style.filter = `brightness(${brightness})`
  }, [])

  const onMouseLeave = useCallback((ev: MouseEvent) => {
    const el = ev.target as HTMLElement | undefined
    if (!el) return

    const imgEl = el.querySelector("img") as HTMLImageElement | undefined
    if (!imgEl) return

    imgEl.style.transform = `rotateX(0deg) rotateY(0deg)`
    imgEl.style.filter = `brightness(1)`
  }, [])

  // #############################################################################
  // Initial animation handling
  // #############################################################################
  const [avatarsInit, setAvatarsInit] = useState(true)

  useTimeoutFn(
    () => {
      setAvatarsInit(false)
    },
    S.AVATAR_INITIAL_SPEED + S.AVATAR_INITIAL_DELAY + 1,
  )

  // #############################################################################
  // Render
  // #############################################################################
  if (avatarUrls.length === 0) {
    return null
  }

  return (
    <>
      {items.map((item) => (
        <S.GridItem key={item.id} $x={item.xPercent} $y={item.yPercent}>
          <S.Avatar
            onClick={item.url ? () => window.open(item.url!) : undefined}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            $animate={avatarsInit}
            style={{
              left: `${item.avatar.x}px`,
              top: `${item.avatar.y}px`,
            }}
          >
            <Image src={item.avatar.url} alt="" fill sizes="100%" />
          </S.Avatar>
        </S.GridItem>
      ))}
    </>
  )
}
