import { APIEmbed } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { Color } from "~/constants"
import { CreditsModel } from "~/server/db/model/Credits"
import { isTextChannel } from "~/server/utils/channel"
import { formatCredits } from "~/server/utils/credits"
import { Task } from "~/types/tasks"

export const resetCredits: Task = async (context) => {
  const model = new CreditsModel(context)

  const botUser = context.guild().client.user
  const botWallet = await model.getWallet(botUser.id)

  await model.removeAll()

  const embeds: APIEmbed[] = [
    {
      color: Color.red,
      title: "All credits have been reset",
      description: `${botUser.displayName} had ${formatCredits(botWallet.credits)}`,
    },
  ]

  const channelIds = [DISCORD_IDS.channels.casino, DISCORD_IDS.channels.logs]

  await Promise.all(
    channelIds.map(async (id) => {
      const channel = context.client.channels.cache.get(id)
      if (isTextChannel(channel)) {
        await channel.send({ embeds })
      }
    }),
  )
}
