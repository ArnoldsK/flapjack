import { VideoEntity } from "../entity/Video"
import { CacheKey } from "../types/enums"
import { createRoute } from "../utils/routes"

export default createRoute({
  path: "/api/videos",
  handler: async (context, _req, res) => {
    let videos = context.cache.get(CacheKey.Videos)

    if (!videos) {
      videos = await VideoEntity.createQueryBuilder()
        .orderBy("createdAt", "DESC")
        .limit(100)
        .getMany()

      context.cache.set(CacheKey.Videos, videos)
    }

    res.json(videos)
  },
})
