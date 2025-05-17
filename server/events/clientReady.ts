import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { DISCORD_IDS } from "../../constants"
import { isTextChannel } from "../utils/channel"
import { Color } from "../../constants"

export default createEvent(
  Events.ClientReady,
  { productionOnly: true },
  async (context) => {
    const channel = context
      .guild()
      .channels.cache.get(DISCORD_IDS.channels.logs)
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
