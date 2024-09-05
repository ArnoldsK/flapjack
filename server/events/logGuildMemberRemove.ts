import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { discordIds } from "../config"
import { isTextChannel } from "../utils/channel"
import { joinAsLines } from "../utils/string"
import { Color } from "../constants"
import { d } from "../utils/date"
import { embedAuthor } from "../utils/member"

export default createEvent(
  Events.GuildMemberRemove,
  { productionOnly: true },
  async (_context, member) => {
    if (member.partial) return

    const channel = member.guild.channels.cache.get(discordIds.channels.logs)
    if (!isTextChannel(channel)) return

    const joinedAt = d(member.joinedAt).fromNow()
    const roles = member.roles.cache
      .filter((role) => role.id !== role.guild.id)
      .map((role) => role.name)

    channel.send({
      embeds: [
        {
          color: Color.black,
          author: embedAuthor(member),
          title: "Left the server",
          description: joinAsLines(
            ...[
              `Joined: ${joinedAt}`,
              roles.length ? `Roles: ${roles.join(", ")}` : "",
            ].filter(Boolean),
          ),
        },
      ],
    })
  },
)
