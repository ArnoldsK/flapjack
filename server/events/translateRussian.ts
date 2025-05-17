import translate from "deepl"
import { createEvent } from "../utils/event"
import { appConfig } from "../config"

const parseContent = (text: string): string => {
  return text
    .replace(/\s+/g, " ")
    .replace(/(?:https?|ftp):\/\/[\n\S]+/g, "")
    .trim()
}

const isMostlyRussian = (text: string): boolean => {
  const cyrillicRegExp = /[\u0400-\u04FF]+/

  const words = text.split(" ")

  const cyrillicWords = words.filter((word) => cyrillicRegExp.test(word))
  const latinWords = words.filter((word) => !cyrillicRegExp.test(word))

  return cyrillicWords.length > latinWords.length / 2
}

export default createEvent(
  "messageCreate",
  { productionOnly: true },
  async (_context, message) => {
    if (message.author.bot) return
    if (!message.member) return

    const authKey = appConfig.deepl.authKey
    if (!authKey) return

    // Re-fetch the message
    message = await message.fetch()

    // Determine content
    let content = parseContent(message.content)

    if (!content.length && message.embeds.length) {
      const embed = message.embeds[0]

      if (embed.description && !embed.url?.includes("youtube.com")) {
        content = parseContent(embed.description)
      }
    }

    if (!content) return
    if (!isMostlyRussian(content)) return

    try {
      const { data } = await translate({
        free_api: true,
        auth_key: authKey,
        text: content,
        target_lang: "EN",
      })

      const lines = data.translations.map((item) => item.text)

      if (!lines.length) return

      message.reply(">>> " + lines.join("\n"))
    } catch (e) {
      console.error(e)
    }
  },
)
