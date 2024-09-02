import { aiCreateRemoteBatches } from "../tasks/aiCreateRemoteBatches"
import { getAiClient } from "../utils/ai"
import { CronTask } from "../utils/cron"

export default {
  description: "Toxic score - create remote batches",

  expression: "every 10 minutes",

  productionOnly: true,

  async execute(context) {
    const ai = getAiClient()
    if (!ai) return

    await aiCreateRemoteBatches(context, ai)
  },
} satisfies CronTask
