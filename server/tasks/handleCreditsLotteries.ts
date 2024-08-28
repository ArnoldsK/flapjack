import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  GuildTextBasedChannel,
} from "discord.js"

import { discordIds } from "../config"
import { CreditsModel } from "../models/Credits"
import { formatCredits } from "../utils/credits"
import { randomBool, randomInt, randomValue } from "../utils/random"
import { dedupe } from "../utils/array"
import { Task } from "../types/tasks"

const getAmount = (): number => {
  // One in 50 to get a mil
  if (randomBool(50)) {
    return 1_000_000
  }

  return (randomInt(2, 20) / 2) * randomValue([1_000, 10_000])!
}

export const handleCreditsLotteries: Task = async (context) => {
  const guild = context.client.guilds.cache.get(discordIds.guild)!
  const channel = guild.channels.cache.get(
    discordIds.channels.general,
  ) as GuildTextBasedChannel

  // One in x minutes chance
  if (!randomBool(20)) return

  const amount = getAmount()

  const customId = `claim-${Math.random()}`
  const row = new ActionRowBuilder<ButtonBuilder>()
  row.addComponents(
    new ButtonBuilder()
      .setCustomId(customId)
      .setLabel(" ")
      .setStyle(ButtonStyle.Secondary)
      .setEmoji("1204533924559065099"),
  )

  const message = await channel.send({ components: [row] })

  const collector = message.createMessageComponentCollector({
    componentType: ComponentType.Button,
    time: 8_000,
  })

  collector.on("collect", (interaction) => {
    interaction.deferUpdate()
  })

  collector.on("end", async (collected) => {
    // Delete the original
    await message.delete()

    // Map to user ids and dedupe
    const userIds = dedupe(collected.map((el) => el.user.id))

    // Get at least 2 members
    const members = userIds
      .map((id) => guild.members.cache.get(id))
      .filter(Boolean)

    if (members.length < 2) return

    // Get random member
    const member = randomValue(members)!

    const creditsModel = new CreditsModel(member)
    await creditsModel.addCredits(amount)

    // Send a new message
    await channel.send({
      embeds: [
        {
          description: `${member.displayName} claimed ${formatCredits(amount)}`,
          color: member.displayColor,
        },
      ],
    })
  })
}
