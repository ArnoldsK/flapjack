import { CronTask } from "../utils/cron"
import { handleCreditsLotteries } from "../tasks/handleCreditsLotteries"

export default {
  description: "Credits lotteries chance",

  expression: "every minute",

  productionOnly: true,

  async execute(context) {
    await handleCreditsLotteries(context)
  },
} satisfies CronTask
