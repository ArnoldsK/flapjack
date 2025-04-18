import { Events, GuildPremiumTier } from "discord.js"

import { createEvent } from "../utils/event"

export default createEvent(
  Events.GuildUpdate,
  { productionOnly: true },
  async (_context, oldGuild, newGuild) => {
    // Skip if wasn't a premium tier drop
    if (
      oldGuild.premiumTier !== GuildPremiumTier.Tier3 &&
      newGuild.premiumTier !== GuildPremiumTier.Tier2
    )
      return

    try {
      await newGuild.setBanner("https://arnoldsk.lv/share/admini.png")
    } catch {
      // Whatever
    }
  },
)
