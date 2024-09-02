import type { Client } from "discord.js"
import cron from "node-cron"
import fs from "fs"
import { join } from "path"

import { appConfig } from "../config"
import { BaseContext } from "../types"

const cronTranslate = require("cron-translate")

export interface CronTask {
  description: string
  expression: string
  isRawExpression?: boolean
  productionOnly?: boolean
  execute: (ctx: BaseContext) => Promise<void>
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

export const handleCron = async (context: BaseContext) => {
  const tasks = getTasks()

  await Promise.all(
    tasks.map(async (task) => {
      const expression = task.isRawExpression
        ? task.expression
        : cronTranslate.toCron(task.expression)

      if (task.productionOnly && appConfig.dev) return

      cron.schedule(expression, async () => {
        try {
          await task.execute(context)
        } catch (err) {
          console.error("> Cron error >", task.description, err)
        }
      })
    }),
  )
}
