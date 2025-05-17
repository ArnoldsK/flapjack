import { createRoute } from "../utils/routes"
import { ApiAvatars } from "../../types/api"
import { isNonNullish } from "../utils/boolean"

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
