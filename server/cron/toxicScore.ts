import { aiCreateRemoteBatches } from "../tasks/aiCreateRemoteBatches"
import { aiHandleRemoteBatches } from "../tasks/aiHandleRemoteBatches"
import { getAiClient } from "../utils/ai"
import { CronTask } from "../utils/cron"

export default {
  description: "Toxic score handler",

  expression: "every 30 minutes",

  productionOnly: true,

  async execute(context) {
    const ai = getAiClient()
    if (!ai) return

    try {
      // First, handle remote batch completions
      await aiHandleRemoteBatches(context, ai)
      // Add new items to the batch
      await aiCreateRemoteBatches(context, ai)
    } catch (err) {
      console.error("Failed to handle toxic score", err)
    }
  },
} satisfies CronTask
