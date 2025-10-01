import { Emoji } from "~/constants"
import { createEvent } from "~/server/utils/event"

export default createEvent(
  "messageCreate",
  { productionOnly: true },
  async (_context, message) => {
    if (message.author.bot) return
    if (!message.content) return

    // #############################################################################
    // SS desktop links
    // #############################################################################
    if (message.content.includes("https://m.ss.")) {
      const matches = message.content.match(
        /(https:\/\/m\.ss\.(?:lv|com)(?:\/.+\.html))/g,
      )
      const urls = [...new Set(matches)].map((url) => url.replace("m.", "www."))

      if (urls.length > 0) {
        message.channel.send(
          `${Emoji.computer} ` + urls.map((url) => `<${url}>`).join("\n"),
        )
      }
    }

    // #############################################################################
    // Twitter FX links
    // #############################################################################
    if (
      message.content.includes("https://twitter.com") ||
      message.content.includes("https://x.com")
    ) {
      message.suppressEmbeds(true)

      const matches = message.content.match(
        /(https:\/\/((?:twitter|x)\.com)\/\w+\/status\/\d+)/i,
      )
      const url = matches?.[1]
      const hostname = matches?.[2]

      const ignore = message.content.includes(`<${url}>`)

      if (!ignore && url && hostname) {
        const fxUrl = url.replace(hostname, "fxtwitter.com")

        await message.reply(`[tweet](${fxUrl}) embed fix`)
      }
    }

    // #############################################################################
    // Square spam embeds (word guessing games)
    // #############################################################################
    const emojiCount = [
      ...message.content.matchAll(
        /[\uD800-\uDBFF]|[\u2702-\u27B0]|[\uF680-\uF6C0]|[\u24C2-\uF251]/g,
      ),
    ].length

    if (emojiCount >= 5) {
      message.suppressEmbeds(true)
    }

    // #############################################################################
    // Instagram
    // #############################################################################
    if (message.content.includes("instagram.com")) {
      const matches = message.content.match(
        /(?:https?:\/\/)?(?:www.)?instagram.com\/?([a-zA-Z0-9._-]+)?\/([p]+)?([reel]+)\/([a-zA-Z0-9\-_.]+)\/?([0-9]+)?/i,
      )
      const reelId = matches?.[4]

      if (reelId) {
        message.suppressEmbeds(true)

        const url = `https://eeinstagram.com/reel/${reelId}/`

        await message.reply(`[reel](${url}) embed fix`)
      }
    }
  },
)
