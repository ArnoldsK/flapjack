import { DISCORD_IDS } from "../../../constants"
import { Task } from "../../../types/tasks"
import { CreditsEntity } from "../../db/entity/Credits"
import { Color } from "../../../constants"

export const resetCredits: Task = async (context) => {
  await CreditsEntity.createQueryBuilder().delete().execute()

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
