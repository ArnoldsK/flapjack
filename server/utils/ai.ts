import { Message } from "discord.js"
import { isUrl } from "./web"

/**
 * Replace emoji syntax with the name.
 *
 * @example
 * cleanEmojis("<:smiley:611094967049519115>") // :smiley:
 */
const cleanEmojis = (content: string): string => {
  return content.replace(/<a?(:.+?:)\d+>/g, "$1")
}

/**
 * Replace any mention syntax with just the mention id.
 *
 * @example
 * cleanMentions("<@611094967049519115>") // @611094967049519115
 */
const cleanMentions = (content: string): string => {
  return content.replace(/<@.+(\d+)>/, "$1")
}

/**
 * Cleans up message content so it can be used for AI parsing.
 * Removes emoji ids, cleans up mentions, links, etc.
 */
export const parseMessageContentForAi = (message: Message): string => {
  let content = message.content

  // Overall cleanup
  content = cleanEmojis(content)
  content = cleanMentions(content)

  // Parse each part
  content = content
    .split("\n")
    .map((line) =>
      line
        .split(" ")
        .map((part) => {
          // Remove urls
          if (isUrl(part)) {
            return ""
          }
          // Clean any mentions

          return part
        })
        .filter((part) => !!part)
        .join(" "),
    )
    .join("\n")

  return content
}
