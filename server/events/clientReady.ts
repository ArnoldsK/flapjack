import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { discordIds } from "../config"
import { isTextChannel } from "../utils/channel"
import { Color } from "../constants"

export default createEvent(
  Events.ClientReady,
  { productionOnly: true },
  async (context) => {
    const channel = context.guild().channels.cache.get(discordIds.channels.logs)
    if (!isTextChannel(channel)) return

    channel.send({
      embeds: [
        {
          color: Color.green,
          description: "Ready for work!",
        },
      ],
    })
  },
)
