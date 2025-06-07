import { Events } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { Color } from "~/constants"
import { isTextChannel } from "~/server/utils/channel"
import { createEvent } from "~/server/utils/event"
import { getNewCommits } from "~/server/utils/git"
import { joinAsLines } from "~/server/utils/string"

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
          description:
            newCommits.length > 0
              ? joinAsLines(
                  ...newCommits.map((commit) => `- ${commit.message}`),
                )
              : "Restarted with no changes (could be a crash)",
        },
      ],
    })
  },
)
