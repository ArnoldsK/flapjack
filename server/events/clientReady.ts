import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { DISCORD_IDS } from "../../constants"
import { isTextChannel } from "../utils/channel"
import { Color } from "../../constants"
import { getNewCommits } from "../utils/git"
import { joinAsLines } from "../utils/string"

export default createEvent(
  Events.ClientReady,
  { productionOnly: true },
  async (context) => {
    const channel = context
      .guild()
      .channels.cache.get(DISCORD_IDS.channels.logs)
    if (!isTextChannel(channel)) return

    const newCommits = await getNewCommits()

    channel.send({
      embeds: [
        {
          color: Color.green,
          description: newCommits.length
            ? joinAsLines(...newCommits.map((commit) => `- ${commit.message}`))
            : "Restarted with no changes",
        },
      ],
    })
  },
)
