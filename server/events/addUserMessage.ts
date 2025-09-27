import { Events } from "discord.js"

import { UserMessageModel } from "~/server/db/model/UserMessage"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (context, message) => {
    if (message.author.bot) return

    const model = new UserMessageModel(context)
    await model.create(message)
  },
)
