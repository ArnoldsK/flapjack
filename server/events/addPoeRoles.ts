import { Events } from "discord.js"
import { createEvent } from "../utils/event"
import { discordIds } from "../config"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (_context, message) => {
    if (message.channel.id !== discordIds.channels.poe) return
    if (message.author.bot) return

    const { member, guild } = message
    if (!member || !guild) return

    const role = guild.roles.cache.get(discordIds.roles.poe)
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
