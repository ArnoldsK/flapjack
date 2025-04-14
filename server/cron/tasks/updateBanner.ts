import { GuildPremiumTier } from "discord.js"
import { appConfig } from "../../config"
import { Task } from "../../types/tasks"
import { requireSetting } from "../../utils/setting"

const getGiphyImageUrl = async (apiKey: string) => {
  const url = new URL("/v1/gifs/random", "https://api.giphy.com")
  url.searchParams.set("api_key", apiKey)
  url.searchParams.set("tag", "fail")

  const res = await fetch(url)
  const json = await res.json()

  return json.data.images.original.url as string
}

export const updateBanner: Task = async (context) => {
  if (!(await requireSetting(context, "tasks.hourlyGifBanners.enabled", true)))
    return

  const apiKey = appConfig.giphy.apiKey
  if (!apiKey) return

  const guild = context.guild()
  const canUseGif = guild.premiumTier === GuildPremiumTier.Tier3

  if (!canUseGif || guild.banner?.startsWith("a_")) return

  try {
    let imageUrl: string | null
    if (canUseGif) {
      imageUrl = await getGiphyImageUrl(apiKey)
    } else if (guild.banner?.startsWith("a_")) {
      imageUrl = "https://arnoldsk.lv/share/admini.png"
    } else {
      imageUrl = null
    }

    if (imageUrl) {
      await guild.setBanner(imageUrl)
    }
  } catch {
    // Whatever
  }
}
