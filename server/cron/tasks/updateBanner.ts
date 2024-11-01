import { GuildPremiumTier } from "discord.js"
import { appConfig } from "../../config"
import { Task } from "../../types/tasks"
import { requireSetting } from "../../utils/setting"

export const updateBanner: Task = async (context) => {
  if (!(await requireSetting(context, "tasks.hourlyGifBanners.enabled", true)))
    return

  const apiKey = appConfig.giphy.apiKey
  if (!apiKey) return

  const guild = context.guild()
  if (guild.premiumTier !== GuildPremiumTier.Tier3) return

  const url = new URL("/v1/gifs/random", "https://api.giphy.com")
  url.searchParams.set("api_key", apiKey)
  url.searchParams.set("tag", "fail")

  try {
    const res = await fetch(url)
    const json = await res.json()
    const imageUrl = json.data.images.original.url as string

    await guild.setBanner(imageUrl)
  } catch {
    // Whatever
  }
}
