import { ClientEvents } from "discord.js"
import fs from "fs"
import { join } from "path"
import { appConfig } from "../config"

export interface EventOptions {
  productionOnly: boolean
}

export type EventTask<K extends keyof ClientEvents> = {
  event: K
  options: EventOptions
  callback: (...args: ClientEvents[K]) => PromiseLike<void>
}

export type EventsGroup<K extends keyof ClientEvents> = Record<
  K,
  ClientEvents[K][]
>

export function createEvent<K extends keyof ClientEvents>(
  event: K,
  options: EventOptions,
  callback: (...args: ClientEvents[K]) => PromiseLike<void>,
): EventTask<K> {
  return {
    event,
    options,
    callback,
  }
}

const getEventTasks = () => {
  const tasks: EventTask<any>[] = []
  const path = join(__dirname, "..", "events")
  const taskFiles = fs.readdirSync(path)

  for (const taskFile of taskFiles) {
    const task = require(join(path, taskFile)).default

    tasks.push(task)
  }

  return tasks
}

export const getGroupedEvents = () => {
  const group: EventsGroup<any> = {}
  const events = getEventTasks()

  for (const { event, callback, options } of events) {
    if (options.productionOnly && !appConfig.dev) continue

    if (!group[event]) {
      group[event] = []
    }

    group[event].push(callback)
  }

  return Object.entries(group).reduce(
    (els, [name, callbacks]) => {
      els.push({
        name,
        callbacks,
      })

      return els
    },
    [] as Array<{
      name: string
      callbacks: Array<(...args: any[]) => Promise<void>>
    }>,
  )
}
