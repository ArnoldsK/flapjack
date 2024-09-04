import { Events } from "discord.js"

import { createEvent } from "../utils/event"
import { discordIds } from "../config"
import { isTextChannel } from "../utils/channel"
import { joinAsLines } from "../utils/string"
import { Color } from "../constants"
import { d } from "../utils/date"

export default createEvent(
  Events.GuildMemberRemove,
  { productionOnly: true },
  async (_context, member) => {
    const ch = member.guild.channels.cache.get(discordIds.channels.logs)
    if (!isTextChannel(ch)) return

    const name =
      member.displayName === member.user.username
        ? `<@${member.id}>`
        : `<@${member.id}> (${member.user.username})`
    const joinedAt = d(member.joinedAt).fromNow()
    const roles = member.roles.cache
      .filter((role) => role.id !== role.guild.id)
      .map((role) => role.name)

    ch.send({
      embeds: [
        {
          color: Color.black,
          description: joinAsLines(
            ...[
              `${name} has left the server`,
              `Joined: ${joinedAt}`,
              roles.length ? `Roles: ${roles.join(", ")}` : "",
            ].filter(Boolean),
          ),
        },
      ],
    })
  },
)
