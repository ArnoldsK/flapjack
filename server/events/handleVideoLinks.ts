import { Events, GuildMember, Message } from "discord.js"
import { createEvent } from "../utils/event"
import { z } from "zod"
import { discordIds } from "../config"
import { VideoEntity } from "../entity/Video"
import { isNonNullish } from "../utils/boolean"
import { EntityFields } from "../types/entity"
import { CacheKey } from "../types/enums"
import { In } from "typeorm"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (context, message) => {
    // #############################################################################
    // Validate message
    // #############################################################################
    const { author, member, content } = message

    if (
      author.bot ||
      !member ||
      !content ||
      message.channel.id !== discordIds.channels.videos
    ) {
      return
    }

    // #############################################################################
    // Extract video IDs
    // #############################################################################
    const messageVideoIds = getVideoIds(content)
    if (!messageVideoIds.length) return

    // #############################################################################
    // Remove videos that have already been saved
    // #############################################################################
    const existingVideos = await VideoEntity.createQueryBuilder()
      .where({
        videoId: In(messageVideoIds),
      })
      .getMany()

    const existingVideoIds = existingVideos.map((video) => video.videoId)
    const videoIds = messageVideoIds.filter(
      (videoId) => !existingVideoIds.includes(videoId),
    )
    if (!videoIds.length) return

    // #############################################################################
    // Get video data
    // #############################################################################
    const videoData = (
      await Promise.all(
        videoIds.map((videoId) =>
          getVideoData({
            videoId,
            message,
            member,
          }),
        ),
      )
    ).filter(isNonNullish)
    if (!videoData.length) return

    // #############################################################################
    // Save video data and clear cache
    // #############################################################################
    await VideoEntity.createQueryBuilder().insert().values(videoData).execute()

    context.cache.set(CacheKey.Videos, null)

    // #############################################################################
    // Send DeArrow titles
    // #############################################################################
    const deArrowTitles = videoData
      .map((video) => video.deArrowTitle)
      .filter(isNonNullish)

    if (deArrowTitles.length) {
      message.reply({
        embeds: deArrowTitles.map((title) => ({
          description: title,
        })),
        allowedMentions: {
          users: [],
          repliedUser: false,
        },
      })
    }
  },
)

const getVideoIds = (content: string): string[] => {
  const regex =
    /((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?/g

  const matches = content.matchAll(regex)
  if (!matches) {
    return []
  }

  const videoIds = Array.from(matches).map((match) => {
    const videoId = match[5]
    return videoId
  })

  return [...new Set(videoIds)]
}

const getVideoDetails = async (videoUrl: string) => {
  const url = new URL("https://noembed.com/embed")
  url.searchParams.set("dataType", "json")
  url.searchParams.set("url", videoUrl)

  try {
    const res = await fetch(url)
    const data = await res.json()

    return z
      .object({
        provider_name: z.literal("YouTube"),
        title: z.string(),
        author_url: z.string().url(),
        author_name: z.string(),
        thumbnail_url: z.string().url(),
        type: z.literal("video"),
      })
      .parse(data)
  } catch (error) {
    console.log("Failed to get video details", error)
    return null
  }
}

const getDeArrowTitle = async (videoId: string): Promise<string | null> => {
  const url = new URL("https://dearrow.minibomba.pro/sbserver/api/branding")
  url.searchParams.set("videoID", videoId)

  try {
    const res = await fetch(url)
    const data = await res.json()

    const { titles } = z
      .object({
        titles: z.array(
          z.object({
            title: z.string(),
            original: z.boolean(),
          }),
        ),
      })
      .parse(data)

    return titles.find((title) => !title.original)?.title ?? null
  } catch (error) {
    console.log("Failed to get DeArrow title", error)
    return null
  }
}

const getVideoData = async ({
  videoId,
  message,
  member,
}: {
  videoId: string
  message: Message
  member: GuildMember
}): Promise<Omit<EntityFields<VideoEntity>, "id" | "createdAt"> | null> => {
  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

  // Get video details
  const videoDetails = await getVideoDetails(videoUrl)
  if (!videoDetails) {
    return null
  }

  // Get DeArrow title
  const deArrowTitle = await getDeArrowTitle(videoId)

  // Result
  return {
    userId: member.id,
    userDisplayName: member.displayName,
    channelId: message.channel.id,
    messageId: message.id,
    videoUrl,
    videoId,
    title: videoDetails.title,
    deArrowTitle,
    thumbnailUrl: videoDetails.thumbnail_url,
    authorName: videoDetails.author_name,
    authorUrl: videoDetails.author_url,
  }
}
