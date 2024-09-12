import { APIEmbed, Guild, GuildMember, MessageCreateOptions } from "discord.js"

import { Color, Unicode } from "../constants"
import { BaseContext } from "../types"
import { isTextChannel } from "./channel"
import { appConfig } from "../config"
import { embedAuthor } from "./member"

export const parseMentions = (content: string, guild: Guild) => {
  return content
    .split(" ")
    .map((part) => {
      // Global
      if (["@everyone", "@channel"].includes(part.toLocaleLowerCase())) {
        return part.replace("@", `@${Unicode.zeroWidthSpace}`)
      }

      // Member
      const matches = part.match(/<@!?([0-9]+)>/)
      const member = matches ? guild.members.cache.get(matches[1]) : null
      if (member) {
        return `@${Unicode.zeroWidthSpace}${member.user.username}`
      }

      return part
    })
    .join(" ")
}

export const sendLogMessage = async (
  context: BaseContext,
  content: MessageCreateOptions,
  overrideChannelId?: string,
) => {
  const channel = context
    .guild()
    .channels.cache.get(
      overrideChannelId ?? appConfig.discord.ids.channels.logs,
    )

  if (isTextChannel(channel)) {
    await channel.send(content)
  }
}

export const getTimeoutAddedEmbed = ({
  member,
  timeoutUntil,
  penaltyText,
}: {
  member: GuildMember
  timeoutUntil: Date
  penaltyText?: string
}): APIEmbed => {
  return {
    color: Color.orange,
    author: embedAuthor(member),
    title: "Timeout added",
    description: `Expires <t:${Math.round(timeoutUntil.getTime() / 1000)}:R>`,
    footer: penaltyText
      ? {
          text: penaltyText,
        }
      : undefined,
  }
}

export const getTimeoutRemovedEmbed = ({
  member,
}: {
  member: GuildMember
}): APIEmbed => {
  return {
    color: Color.blue,
    author: embedAuthor(member),
    title: "Timeout removed",
  }
}
