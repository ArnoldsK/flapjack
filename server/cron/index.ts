import { CronTask } from "../utils/cron"
import { endReminders } from "./tasks/endReminders"
import { handleCreditsLotteries } from "./tasks/handleCreditsLotteries"
import { mcStatus } from "./tasks/mcStatus"
import { resetCredits } from "./tasks/resetCredits"
import { updateBanner } from "./tasks/updateBanner"

export const cronTasks: CronTask[] = [
  {
    description: "Credits reset",
    // At 12:00 AM, on day 1 of the month, every 3 months
    expression: "0 0 0 1 */3 *",
    isRawExpression: true,
    productionOnly: true,
    task: resetCredits,
  },
  {
    description: "Credits lotteries chance",
    expression: "every minute",
    isRawExpression: false,
    productionOnly: true,
    task: handleCreditsLotteries,
  },
  {
    description: "MC status",
    expression: "every 5 minutes",
    isRawExpression: false,
    productionOnly: true,
    task: mcStatus,
  },
  {
    description: "End reminders",
    expression: "every minute",
    isRawExpression: false,
    productionOnly: true,
    task: endReminders,
  },
  {
    description: "Update banner",
    expression: "every hour",
    isRawExpression: false,
    productionOnly: true,
    task: updateBanner,
  },
]