import { createCanvas } from "@napi-rs/canvas"

import { mapping, ScarabMapping } from "~/constants/scarabs"
import { canvasFont } from "~/server/utils/canvas"
import { d } from "~/server/utils/date"
import { PoeScarab } from "~/types/poe"

const ROW_GAP = 10
const SCARAB_GAP = 4
const SCARAB_SIZE = 48
const SCARAB_SIZE_W = 52
const BAD_VALUE_MAX = 1
const GOOD_VALUE_MIN = 2

interface Options {
  scarabByName: Map<string, PoeScarab>
}

export const getScarabPriceOverlay = ({
  scarabs,
  updatedAt,
}: {
  scarabs: PoeScarab[]
  updatedAt: Date
}): Buffer => {
  const canvas = createCanvas(820, 780)
  const ctx = canvas.getContext("2d")

  const scarabByName = new Map(scarabs.map((scarab) => [scarab.name, scarab]))

  let y = 20
  for (const row of mapping.rows) {
    const rowCanvas = getRowCanvas(row, { scarabByName })

    const x =
      (canvas.width - rowCanvas.width) / 2 +
      (row.scuffed ? SCARAB_SIZE * 0.33 : 0)

    ctx.drawImage(rowCanvas, x, y)
    y += rowCanvas.height + ROW_GAP
  }

  ctx.textAlign = "left"
  ctx.textBaseline = "top"
  ctx.font = canvasFont(10)
  ctx.fillStyle = "#fff"
  ctx.fillText(d(updatedAt).tz("Europe/Riga").format("DD/MM/YYYY HH:mm"), 0, 0)

  return canvas.toBuffer("image/png")
}

const getRowCanvas = (row: ScarabMapping.Row, options: Options) => {
  const columnCanvases = row.columns.map((column) =>
    getColumnCanvas(column, options),
  )

  const width =
    columnCanvases.reduce((acc, columnCanvas) => acc + columnCanvas.width, 0) +
    (columnCanvases.length - 1) * row.gap +
    (row.scuffed ? SCARAB_SIZE * 0.66 : 0)
  const height = Math.max(
    ...columnCanvases.map((columnCanvas) => columnCanvas.height),
  )

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  let x = 0
  for (const columnCanvas of columnCanvases) {
    const y = (height - columnCanvas.height) / 2
    ctx.drawImage(columnCanvas, x, y)
    x += columnCanvas.width + row.gap
    if (row.scuffed) {
      x += SCARAB_SIZE * 0.66
    }
  }

  return canvas
}

const getColumnCanvas = (column: ScarabMapping.Column, options: Options) => {
  const groupCanvases = column.groups.map((group) =>
    getGroupCanvas(group, options),
  )

  const width = Math.max(
    ...groupCanvases.map((groupCanvas) => groupCanvas.width),
  )
  const height =
    groupCanvases.reduce((acc, groupCanvas) => acc + groupCanvas.height, 0) +
    (groupCanvases.length - 1) * ROW_GAP

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  let y = 0
  for (const groupCanvas of groupCanvases) {
    const x = (width - groupCanvas.width) / 2
    ctx.drawImage(groupCanvas, x, y)
    y += SCARAB_SIZE + ROW_GAP
  }

  return canvas
}

const getGroupCanvas = (group: ScarabMapping.Group, options: Options) => {
  const scarabWidth = group.wide ? SCARAB_SIZE_W : SCARAB_SIZE
  const width =
    group.scarabs.length * scarabWidth + (group.scarabs.length - 1) * SCARAB_GAP
  const height = SCARAB_SIZE

  const canvas = createCanvas(width, height)
  const ctx = canvas.getContext("2d")

  let x = 0
  for (const name of group.scarabs) {
    const scarab = options.scarabByName.get(name)

    if (scarab) {
      const value = Math.floor(scarab?.chaosValue ?? 0)
      const bad = value < BAD_VALUE_MAX
      const good = value > GOOD_VALUE_MIN
      const color = bad ? "#4b1a1a" : good ? "#1a4b1a" : "#4b4b4b"

      ctx.textAlign = "left"
      ctx.textBaseline = "bottom"
      ctx.font = canvasFont(12)

      const text = `${value}c`
      const metrics = ctx.measureText(text)
      const padding = 4

      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(
        x,
        SCARAB_SIZE - padding - metrics.emHeightAscent,
        scarabWidth,
        metrics.emHeightAscent + padding,
        padding,
      )
      ctx.fill()

      ctx.fillStyle = "#fff"
      ctx.fillText(
        text,
        x + SCARAB_SIZE / 2 - metrics.width / 2,
        SCARAB_SIZE - padding / 2,
      )
    }

    x += scarabWidth + SCARAB_GAP
  }

  return canvas
}
