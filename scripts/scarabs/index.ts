import { writeFileSync } from "node:fs"
import path from "node:path"

import data from "./data.json"

import { getScarabPriceOverlay } from "~/server/canvas/scarabPriceOverlay"

const run = async () => {
  const image = getScarabPriceOverlay({
    scarabs: data.scarabs,
    updatedAt: new Date(data.updatedAt),
  })

  writeFileSync(path.join(__dirname, "scarabs.png"), image as unknown as string)
}

run()
