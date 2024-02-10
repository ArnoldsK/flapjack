import { discordIds } from "../config"
import { Color } from "../constants"
import CreditsEntity from "../entity/Credits"
import { CronTask } from "../utils/cron"

export default {
  description: "Credits reset",

  // At 12:00 AM, on day 1 of the month, every 3 months
  expression: "0 0 0 1 */3 *",

  isRawExpression: true,

  productionOnly: true,

  async execute(client) {
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
        const channel = client.channels.cache.get(id)
        if (channel?.isTextBased()) {
          await channel.send({ embeds })
        }
      }),
    )
  },
} as CronTask
