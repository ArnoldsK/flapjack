import { AuditLogEvent, Events, GuildMember } from "discord.js"

import { createEvent } from "../utils/event"
import { DISCORD_IDS } from "../../constants"
import { isTextChannel } from "../utils/channel"
import { joinAsLines } from "../utils/string"
import { Color } from "../../constants"
import { d } from "../utils/date"
import { embedAuthor } from "../utils/member"

const getAuditLogsData = async (member: GuildMember) => {
  let auditLogs
  try {
    auditLogs = await member.guild.fetchAuditLogs({
      limit: 5,
    })
  } catch {
    return {
      banned: false,
      kicked: false,
      reason: null,
    }
  }

  const bannedReason =
    auditLogs.entries.find((entry) => {
      return (
        entry.targetId &&
        entry.targetId === member.id &&
        entry.action === AuditLogEvent.MemberBanAdd
      )
    })?.reason || null

  const kickedReason =
    auditLogs.entries.find((entry) => {
      return (
        entry.targetId &&
        entry.targetId === member.id &&
        entry.action === AuditLogEvent.MemberKick
      )
    })?.reason || null

  return {
    banned: Boolean(bannedReason),
    kicked: Boolean(kickedReason),
    reason: bannedReason || kickedReason,
  }
}

export default createEvent(
  Events.GuildMemberRemove,
  { productionOnly: true },
  async (_context, member) => {
    if (member.partial) return

    const channel = member.guild.channels.cache.get(DISCORD_IDS.channels.logs)
    if (!isTextChannel(channel)) return

    const joinedAt = d(member.joinedAt).fromNow()
    const roles = member.roles.cache
      .filter((role) => role.id !== role.guild.id)
      .map((role) => role.name)

    const { banned, kicked, reason } = await getAuditLogsData(member)

    let title = "Left the server"
    if (banned) {
      title = "Banned from the server"
    } else if (kicked) {
      title = "Kicked from the server"
    }

    channel.send({
      embeds: [
        {
          color: Color.black,
          author: embedAuthor(member),
          title,
          description: joinAsLines(
            ...[
              reason ? `Reason: ${reason}` : "",
              `Joined: ${joinedAt}`,
              roles.length ? `Roles: ${roles.join(", ")}` : "",
            ].filter(Boolean),
          ),
        },
      ],
    })
  },
)
