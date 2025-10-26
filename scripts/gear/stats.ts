import { items } from "~/scripts/gear/_init"
import { getCombinedItemStats } from "~/server/utils/gear"

const run = async () => {
  const stats = getCombinedItemStats(items)

  console.log(stats)
}

run()
