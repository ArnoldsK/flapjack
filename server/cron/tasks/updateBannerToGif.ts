import { GuildPremiumTier } from "discord.js"
import { appConfig } from "~/server/config"
import { Task } from "~/types/tasks"
import { requireSetting } from "~/server/utils/setting"

const getGiphyImageUrl = async (apiKey: string) => {
  const url = new URL("/v1/gifs/random", "https://api.giphy.com")
  url.searchParams.set("api_key", apiKey)
  url.searchParams.set("tag", "fail")

  const res = await fetch(url)
  const json = await res.json()

  return json.data.images.original.url as string
}

export const updateBannerToGif: Task = async (context) => {
  const apiKey = appConfig.giphy.apiKey
  if (!apiKey) return

  const guild = context.guild()

  if (guild.premiumTier !== GuildPremiumTier.Tier3) return

  if (!(await requireSetting(context, "tasks.hourlyGifBanners.enabled", true)))
    return

  try {
    const imageUrl = await getGiphyImageUrl(apiKey)

    if (imageUrl) {
      await guild.setBanner(imageUrl)
    }
  } catch {
    // Whatever
  }
}
