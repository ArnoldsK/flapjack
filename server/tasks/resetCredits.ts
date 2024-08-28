import { discordIds } from "../config"
import { Task } from "../types/tasks"
import CreditsEntity from "../entity/Credits"
import { Color } from "../constants"

export const resetCredits: Task = async (context) => {
  await CreditsEntity.createQueryBuilder().delete().execute()

  const embeds = [
    {
      color: Color.red,
      title: `All credits have been reset`,
    },
  ]

  const channelIds = [discordIds.channels.casino, discordIds.channels.logs]

  await Promise.all(
    channelIds.map(async (id) => {
      const channel = context.client.channels.cache.get(id)
      if (channel?.isTextBased()) {
        await channel.send({ embeds })
      }
    }),
  )
}
