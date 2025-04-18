import { Events, GuildPremiumTier } from "discord.js"

import { createEvent } from "../utils/event"
import { requireSetting } from "../utils/setting"

export default createEvent(
  Events.GuildUpdate,
  { productionOnly: true },
  async (context, oldGuild, newGuild) => {
    // Skip if wasn't a premium tier drop
    if (
      oldGuild.premiumTier !== GuildPremiumTier.Tier3 &&
      newGuild.premiumTier !== GuildPremiumTier.Tier2
    )
      return

    if (
      !(await requireSetting(context, "tasks.hourlyGifBanners.enabled", true))
    )
      return

    try {
      await newGuild.setBanner("https://arnoldsk.lv/share/admini.png")
    } catch {
      // Whatever
    }
  },
)
