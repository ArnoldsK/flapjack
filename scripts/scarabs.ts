import { writeFileSync } from "node:fs"
import path from "node:path"

import { getScarabPriceOverlay } from "~/server/canvas/scarabPriceOverlay"

const run = async () => {
  const image = getScarabPriceOverlay({ scarabs: [], updatedAt: new Date() })

  writeFileSync(path.join(__dirname, "scarabs.png"), image as unknown as string)
}

run()
