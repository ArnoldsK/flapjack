import type { Client } from "discord.js"
import cron from "node-cron"
import fs from "fs"
import { join } from "path"
import { appConfig } from "../config"

const cronTranslate = require("cron-translate")

export interface CronTask {
  description: string
  expression: string
  isRawExpression?: boolean
  productionOnly?: boolean
  execute: (client: Client) => Promise<void>
}

const getTasks = () => {
  const tasks: CronTask[] = []
  const path = join(__dirname, "..", "cron")
  const taskFiles = fs.readdirSync(path)

  for (const taskFile of taskFiles) {
    const task = require(join(path, taskFile)).default

    tasks.push(task)
  }

  return tasks
}

export const handleCron = (client: Client) => {
  const tasks = getTasks()

  for (const task of tasks) {
    const expression = task.isRawExpression
      ? task.expression
      : cronTranslate.toCron(task.expression)

    if (task.productionOnly && appConfig.dev) continue

    cron.schedule(expression, () => {
      // console.log(">", task.description)
      task.execute(client)
    })
  }
}
