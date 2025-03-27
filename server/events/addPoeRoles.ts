import { Events } from "discord.js"
import { createEvent } from "../utils/event"
import { discordIds } from "../config"
import { isTextChannel } from "../utils/channel"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (_context, message) => {
    if (message.channel.id !== discordIds.channels.poe) return
    if (message.author.bot) return

    const { member, guild } = message
    if (!member || !guild) return

    const channels = [
      guild.channels.cache.get(discordIds.channels.poe1News),
      guild.channels.cache.get(discordIds.channels.poe2News),
    ].filter(isTextChannel)

    try {
      // Add user read permission to poe1-news and poe2-news
      await Promise.all(
        channels.map(async (channel) => {
          if (!channel.permissionOverwrites.cache.has(member.id)) {
            await channel.permissionOverwrites.create(member, {
              ViewChannel: true,
            })
          }
        }),
      )
    } catch {
      // Do nothing
    }
  },
)
