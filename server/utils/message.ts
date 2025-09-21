import {
  APIEmbed,
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  Message,
  MessageCreateOptions,
} from "discord.js"

import { Color, DISCORD_IDS, Unicode } from "~/constants"
import { isTextChannel } from "~/server/utils/channel"
import { embedAuthor } from "~/server/utils/member"
import { BaseContext, Nullish } from "~/types"

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
    .channels.cache.get(overrideChannelId ?? DISCORD_IDS.channels.logs)

  if (isTextChannel(channel)) {
    await channel.send(content)
  }
}

export const contentRelativeTime = (timestamp: number): string => {
  return `<t:${Math.round(timestamp / 1000)}:R>`
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
    description: `Expires ${contentRelativeTime(timeoutUntil.getTime())}`,
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

export const getOrFetchMessage = async (
  channel: GuildTextBasedChannel,
  messageId: string,
): Promise<Nullish<Message>> => {
  try {
    const cachedMessage = channel.messages.cache.get(messageId)
    if (cachedMessage) return cachedMessage
    return await channel.messages.fetch(messageId)
  } catch {
    return null
  }
}
