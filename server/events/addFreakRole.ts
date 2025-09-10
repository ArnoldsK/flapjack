import { Events } from "discord.js"

import { createEvent } from "~/server/utils/event"

const FREAK_ROLE_ID = "1415217496151035924"

const FREAK_USERNAMES = new Set([
  "anarchystoaster",
  "Pissfridge",
  "st3lth",
  "Karlsonier",
  "davido4ka",
  "mono_lv",
  "inserrt",
  "__rai__",
  "nimstail",
  "lightingzap",
  "reinye",
  "lightingzap",
  "Polterghaasstt",
  "Electrum18",
  "foxrukey",
])

export default createEvent(
  Events.GuildMemberAdd,
  { productionOnly: true },
  async (context, member) => {
    if (member.user.bot) return

    if (!FREAK_USERNAMES.has(member.user.username)) return

    const role = context.guild().roles.cache.get(FREAK_ROLE_ID)
    if (!role) return

    try {
      await member.roles.add(role)
    } catch {
      console.error(`Failed to add a freak role for ${member.user.username}`)
    }
  },
)
