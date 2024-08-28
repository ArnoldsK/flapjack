import { resetCredits } from "../tasks/resetCredits"
import { CronTask } from "../utils/cron"

export default {
  description: "Credits reset",

  // At 12:00 AM, on day 1 of the month, every 3 months
  expression: "0 0 0 1 */3 *",

  isRawExpression: true,

  productionOnly: true,

  async execute(context) {
    await resetCredits(context)
  },
} as CronTask
