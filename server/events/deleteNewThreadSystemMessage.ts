import { setTimeout } from "node:timers/promises"

import { MessageType } from "discord.js"

import { createEvent } from "~/server/utils/event"

export default createEvent(
  "messageCreate",
  { productionOnly: true },
  async (_context, message) => {
    if (!message.system) return

    if (message.type !== MessageType.ThreadCreated) return
    if (message.hasThread) return

    await setTimeout(10_000)

    message.delete()
  },
)
