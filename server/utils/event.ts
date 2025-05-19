import { ClientEvents } from "discord.js"

import { appConfig } from "~/server/config"
import { getEvents } from "~/server/events"
import { BaseContext } from "~/types"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyEvent = any

export interface EventOptions {
  productionOnly: boolean
}

export type EventTask<K extends keyof ClientEvents> = {
  event: K
  options: EventOptions
  callback: (
    context: BaseContext,
    ...args: ClientEvents[K]
  ) => PromiseLike<void>
}

export type EventsGroup<K extends keyof ClientEvents> = Record<
  K,
  ClientEvents[K][]
>

export function createEvent<K extends keyof ClientEvents>(
  event: K,
  options: EventOptions,
  callback: (
    context: BaseContext,
    ...args: ClientEvents[K]
  ) => PromiseLike<void>,
): EventTask<K> {
  return {
    event,
    options,
    callback,
  }
}

export const getGroupedEvents = async () => {
  const group: EventsGroup<AnyEvent> = {}
  const events = await getEvents()

  for (const { event, callback, options } of events) {
    if (options.productionOnly && appConfig.dev) continue

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
      callbacks: Array<(...args: AnyEvent[]) => Promise<void>>
    }>,
  )
}
