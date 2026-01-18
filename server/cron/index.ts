import { createDailyStats } from "~/server/cron/tasks/createDailyStats"
import { createWeekRecap } from "~/server/cron/tasks/createWeekRecap"
import { endReminders } from "~/server/cron/tasks/endReminders"
// import { handleCreditsLotteries } from "~/server/cron/tasks/handleCreditsLotteries"
// import { mcStatus } from "~/server/cron/tasks/mcStatus"
import { removeNonBoosterIcons } from "~/server/cron/tasks/removeNonBoosterIcons"
import { removeOldStats } from "~/server/cron/tasks/removeOldStats"
import { resetCredits } from "~/server/cron/tasks/resetCredits"
import { resetPoeScarabsStaticData } from "~/server/cron/tasks/resetPoeScarabsStaticData"
import { updateBannerToGif } from "~/server/cron/tasks/updateBannerToGif"
import { CronTask } from "~/server/utils/cron"

export const cronTasks: CronTask[] = [
  {
    description: "Credits reset",
    // At 12:00 AM, on day 1 of the month, every 3 months
    expression: "0 0 0 1 */3 *",
    isRawExpression: true,
    productionOnly: true,
    task: resetCredits,
  },
  // {
  //   description: "Credits lotteries chance",
  //   expression: "every minute",
  //   isRawExpression: false,
  //   productionOnly: true,
  //   task: handleCreditsLotteries,
  // },
  // {
  //   description: "MC status",
  //   expression: "every 5 minutes",
  //   isRawExpression: false,
  //   productionOnly: true,
  //   task: mcStatus,
  // },
  {
    description: "End reminders",
    expression: "every minute",
    isRawExpression: false,
    productionOnly: true,
    task: endReminders,
  },
  {
    description: "Update banner to a gif",
    expression: "every hour",
    isRawExpression: false,
    productionOnly: true,
    task: updateBannerToGif,
  },
  {
    description: "Remove non-booster icons",
    expression: "every 10 minutes",
    isRawExpression: false,
    productionOnly: true,
    task: removeNonBoosterIcons,
  },
  {
    description: "Remove old stats",
    expression: "every hour",
    isRawExpression: false,
    productionOnly: false,
    task: removeOldStats,
  },
  {
    description: "Create week recap",
    expression: "every monday",
    isRawExpression: false,
    productionOnly: true,
    task: createWeekRecap,
  },
  {
    description: "Create daily stats",
    expression: "every hour",
    isRawExpression: false,
    productionOnly: true,
    task: createDailyStats,
  },
  {
    description: "Reset PoE scarabs static data",
    expression: "every 20 minutes",
    isRawExpression: false,
    productionOnly: true,
    task: resetPoeScarabsStaticData,
  },
]
