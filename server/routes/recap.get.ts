import { createRoute } from "~/server/utils/routes"
import { ApiRecap } from "~/types/api"
import { StaticModel } from "~/server/db/model/Static"
import { dedupe } from "~/server/utils/array"
import { StaticDataType } from "~/types/entity"

export default createRoute({
  path: "/api/recap",
  handler: async (context, _req, res) => {
    const guild = context.guild()

    const response: ApiRecap = {
      recap: {
        createdAt: new Date(),
        messages: [],
      },
      members: [],
    }

    const model = new StaticModel(StaticDataType.WeekRecap)
    const recap = await model.get()

    if (recap) {
      response.recap = recap

      const recapMemberIds = dedupe(
        recap.messages.map((message) => message.member.id),
      )

      response.members = guild.members.cache
        .filter(
          (member) => !member.user.bot && recapMemberIds.includes(member.id),
        )
        .map((member) => ({
          memberId: member.id,
          avatarUrl: member.displayAvatarURL({
            forceStatic: true,
            extension: "png",
            size: 128,
          }),
          displayColor: member.displayHexColor,
        }))
    }

    res.json(response)
  },
})
