import { isNonNullish } from "~/server/utils/boolean"
import { createRoute } from "~/server/utils/routes"
import { ApiAvatars } from "~/types/api"

export default createRoute({
  path: "/api/avatars",
  handler: async (context, _req, res) => {
    const guild = context.guild()

    const avatarUrls = guild.members.cache
      .filter(
        (member) => !member.user.bot && (member.avatar || member.user.avatar),
      )
      .map((member) =>
        member.displayAvatarURL({
          forceStatic: true,
          extension: "png",
          size: 128,
        }),
      )
      .filter(isNonNullish)

    const avatars: ApiAvatars = {
      urls: avatarUrls,
    }

    res.json(avatars)
  },
})
