import { CacheKey } from "~/server/cache"
import { VideoEntity } from "~/server/db/entity/Video"
import { createRoute } from "~/server/utils/routes"

export default createRoute({
  path: "/api/videos",
  handler: async (context, _req, res) => {
    let videos = context.cache.get(CacheKey.Videos)

    if (!videos) {
      videos = await context.em().findAll(VideoEntity, {
        orderBy: {
          createdAt: "DESC",
        },
        limit: 100,
      })

      context.cache.set(CacheKey.Videos, videos)
    }

    // Use fresh display names
    const members = context.guild().members.cache
    videos = videos.map((video) => ({
      ...video,
      userDisplayName:
        members.get(video.userId)?.displayName ?? video.userDisplayName,
    }))

    res.json(videos)
  },
})
