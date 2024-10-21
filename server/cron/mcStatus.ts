import { mcStatus } from "../tasks/mcStatus"
import { CronTask } from "../utils/cron"

export default {
  description: "MC status",

  expression: "every minute",

  productionOnly: true,

  async execute(context) {
    // TODO re-enable
    // await mcStatus(context)
  },
} as CronTask
