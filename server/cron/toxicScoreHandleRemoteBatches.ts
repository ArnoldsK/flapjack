import { aiHandleRemoteBatches } from "../tasks/aiHandleRemoteBatches"
import { getAiClient } from "../utils/ai"
import { CronTask } from "../utils/cron"

export default {
  description: "Toxic score - handle remote batches",

  expression: "every 1 minute",

  productionOnly: true,

  async execute(context) {
    const ai = getAiClient()
    if (!ai) return

    await aiHandleRemoteBatches(context, ai)
  },
} satisfies CronTask
