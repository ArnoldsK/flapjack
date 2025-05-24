import { DISCORD_IDS } from "~/constants"
import { Color } from "~/constants"
import { CreditsModel } from "~/server/db/model/Credits"
import { Task } from "~/types/tasks"

export const resetCredits: Task = async (context) => {
  const model = new CreditsModel(context)
  await model.removeAll()

  const embeds = [
    {
      color: Color.red,
      title: `All credits have been reset`,
    },
  ]

  const channelIds = [DISCORD_IDS.channels.casino, DISCORD_IDS.channels.logs]

  await Promise.all(
    channelIds.map(async (id) => {
      const channel = context.client.channels.cache.get(id)
      if (channel?.isTextBased()) {
        await channel.send({ embeds })
      }
    }),
  )
}
