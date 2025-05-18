import { Events } from "discord.js"
import { createEvent } from "~/server/utils/event"
import { DISCORD_IDS } from "~/constants"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (_context, message) => {
    if (message.channel.id !== DISCORD_IDS.channels.poe) return
    if (message.author.bot) return

    const { member, guild } = message
    if (!member || !guild) return

    const role = guild.roles.cache.get(DISCORD_IDS.roles.poe)
    if (!role) return

    try {
      if (!member.roles.cache.has(role.id)) {
        await member.roles.add(role)
      }
    } catch {
      // Do nothing
    }
  },
)
