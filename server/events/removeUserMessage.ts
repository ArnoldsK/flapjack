import { Events } from "discord.js"

import { UserMessageModel } from "~/server/db/model/UserMessage"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  Events.MessageDelete,
  { productionOnly: false },
  async (context, message) => {
    const model = new UserMessageModel(context)
    await model.removeByMessageId(message.id)
  },
)
