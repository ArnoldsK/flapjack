import { Events } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { createEvent } from "~/server/utils/event"

const CHANNEL_ROLE_IDS = new Map([
  [DISCORD_IDS.channels.poe, DISCORD_IDS.roles.poe],
  [DISCORD_IDS.channels.runescape, DISCORD_IDS.roles.rs],
])

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (context, message) => {
    if (message.author.bot) return
    if (!message.member) return

    const roleId = CHANNEL_ROLE_IDS.get(message.channel.id)
    if (!roleId) return

    const role = context.guild().roles.cache.get(roleId)
    if (!role) return

    try {
      if (!message.member.roles.cache.has(role.id)) {
        await message.member.roles.add(role)
      }
    } catch {
      // Do nothing
    }
  },
)
