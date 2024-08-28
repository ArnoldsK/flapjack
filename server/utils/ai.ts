import { Message } from "discord.js"
import OpenAI from "openai"

import { isUrl } from "./web"
import { appConfig } from "../config"
import { createReadStream, writeFileSync } from "fs"
import path from "path"

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

export const getAiClient = () => {
  if (!appConfig.openAi.secretKey) {
    return null
  }

  return new OpenAI({
    apiKey: appConfig.openAi.secretKey,
    project: appConfig.openAi.projectId,
  })
}

export const handleCreateAiBatch = async (batches: string[]) => {
  const ai = getAiClient()
  if (!ai) {
    throw new Error("AI not configured")
  }

  const filename = path.join(process.cwd(), "tmp", "openai-batches.jsonl")
  writeFileSync(filename, batches.join("\n"))

  const file = await ai.files.create({
    file: createReadStream(filename),
    purpose: "batch",
  })

  return await ai.batches.create({
    input_file_id: file.id,
    endpoint: "/v1/chat/completions",
    completion_window: "24h",
  })
}
