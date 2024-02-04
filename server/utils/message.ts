import { Guild } from "discord.js"
import { Unicode } from "../constants"

export const escapeMentions = (content: string, guild: Guild) => {
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
