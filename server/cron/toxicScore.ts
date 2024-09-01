import { aiCreateRemoteBatches } from "../tasks/aiCreateRemoteBatches"
import { aiHandleRemoteBatches } from "../tasks/aiHandleRemoteBatches"
import { getAiClient } from "../utils/ai"
import { CronTask } from "../utils/cron"

export default {
  description: "Toxic score handler",

  // It can take up to 24 hours to parse, but usually it's done in like 1 minute
  // I rather get less messages to check than get too many at once with longer duration
  expression: "every 10 minutes",

  productionOnly: false,

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
