import { Events } from "discord.js"

import { StatsModel } from "~/server/db/model/Stats"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: false },
  async (context, message) => {
    if (message.author.bot) return
    if (!message.member) return

    const model = new StatsModel(context)
    await model.create({
      channelId: message.channel.id,
      userId: message.author.id,
    })
  },
)
