import { updateBanner } from "../tasks/updateBanner"
import { CronTask } from "../utils/cron"

export default {
  description: "Update banner",

  expression: "every hour",

  productionOnly: true,

  async execute(context) {
    await updateBanner(context)
  },
} as CronTask
