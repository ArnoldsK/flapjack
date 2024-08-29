import { Message } from "discord.js"
import OpenAI from "openai"
import path from "path"

import { isUrl } from "./web"
import { appConfig } from "../config"
import { z } from "zod"
import { isNonNullish } from "./boolean"

/**
 * Replace emoji syntax with the name.
 *
 * @example
 * cleanEmojis("<:smiley:611094967049519115>") // :smiley:
 */
const cleanEmojis = (content: string): string => {
  return content.replace(/<a?(:.+?:)\d+>/g, "$1")
}

const removeEmojis = (content: string): string => {
  return content.replace(/<a?:.+?:\d+>/g, "")
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

  // Single line for parsing overall stuff
  const singleLineContent = content.split("\n").join(" ")

  // Remove number only messages
  if (
    !singleLineContent
      .split(" ")
      .map((part) => part.replace(/\d+/g, ""))
      .join("")
      .trim().length
  ) {
    return ""
  }

  // Scuffed way to remove emoji only messages
  if (
    !singleLineContent
      .split(" ")
      .map((part) => removeEmojis(part))
      .join("")
      .trim().length
  ) {
    return ""
  }

  // Trim too long messages
  return content.substring(0, 255)
}

export const getAiClient = () => {
  if (!appConfig.openAi.secretKey) {
    return null
  }

  return new OpenAI({
    apiKey: appConfig.openAi.secretKey,
    project: appConfig.openAi.projectId,
  })
}

export const getAiBatchTmpFilePath = () => {
  return path.join(process.cwd(), "tmp", `openai-batches-${Date.now()}.jsonl`)
}

const batchFileResponseSchema = z.object({
  id: z.string(),
  custom_id: z.string(),
  response: z.object({
    body: z.object({
      choices: z
        .array(
          z.object({
            message: z.object({
              content: z.string(),
            }),
          }),
        )
        .nonempty(),
    }),
  }),
})

export const parseAiBatchFileResponses = (contents: string) => {
  return (
    contents
      .split("\n")
      // Scuffed json validation; could also just try catch json parse
      .filter((el) => !!el && el.startsWith("{"))
      .map((el) => batchFileResponseSchema.safeParse(JSON.parse(el)).data)
      .filter(isNonNullish)
  )
}

export const aiCustomId = {
  get: ({
    oldestEntityId,
    newestEntityId,
  }: {
    oldestEntityId: string
    newestEntityId: string
  }) => {
    return `${oldestEntityId}-${newestEntityId}`
  },
  parse: (value: string) => {
    const [oldestEntityId, newestEntityId] = value.split("-")
    return { oldestEntityId, newestEntityId }
  },
}
