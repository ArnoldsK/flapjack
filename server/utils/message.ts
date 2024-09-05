import { Guild, MessageCreateOptions } from "discord.js"

import { Unicode } from "../constants"
import { BaseContext } from "../types"
import { isTextChannel } from "./channel"
import { appConfig } from "../config"

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
