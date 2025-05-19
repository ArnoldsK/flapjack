import cron from "node-cron"

import { appConfig } from "~/server/config"
import { cronTasks } from "~/server/cron"
import { BaseContext } from "~/types"
import { Task } from "~/types/tasks"

// eslint-disable-next-line @typescript-eslint/no-require-imports
const cronTranslate = require("cron-translate")

export interface CronTask {
  description: string
  expression: string
  isRawExpression: boolean
  productionOnly: boolean
  task: Task
}

export const handleCron = async (context: BaseContext) => {
  await Promise.all(
    cronTasks.map(async (task) => {
      const expression = task.isRawExpression
        ? task.expression
        : cronTranslate.toCron(task.expression)

      if (task.productionOnly && appConfig.dev) return

      cron.schedule(expression, async () => {
        try {
          await task.task(context)
        } catch (error) {
          console.error("> Cron error >", task.description, error)
        }
      })
    }),
  )
}
