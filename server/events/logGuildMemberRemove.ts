import { Events } from "discord.js"
import moment from "moment"

import { createEvent } from "../utils/event"
import { discordIds } from "../config"
import { isTextChannel } from "../utils/channel"
import { joinAsLines } from "../utils/string"
import { Color } from "../constants"

export default createEvent(
  Events.GuildMemberRemove,
  { productionOnly: true },
  async (member) => {
    const ch = member.guild.channels.cache.get(discordIds.channels.logs)
    if (!isTextChannel(ch)) return

    const joinedAt = moment(member.joinedAt).fromNow()
    const roles = member.roles.cache.map((role) => role.name)

    ch.send({
      embeds: [
        {
          color: Color.black,
          description: joinAsLines(
            `<@${member.id}> (${member.displayName}) has left the server`,
            `Joined: ${joinedAt}`,
            `Roles: ${roles.join(", ")}`,
          ),
        },
      ],
    })
  },
)
