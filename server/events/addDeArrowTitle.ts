import { Events } from "discord.js"
import { createEvent } from "../utils/event"
import { z } from "zod"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (_context, message) => {
    if (message.author.bot) return
    if (!message.member) return

    const ytMatch = message.content.match(
      /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(?:-nocookie)?\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)(\S+)?$/,
    )
    if (!ytMatch) return

    const videoId = ytMatch[5]
    if (!videoId) return

    const url = new URL(
      "/sbserver/api/branding",
      "https://dearrow.minibomba.pro",
    )
    url.searchParams.set("videoID", videoId)

    try {
      const res = await fetch(url)
      const rawData = await res.json()

      const data = z
        .object({
          titles: z.array(
            z.object({
              title: z.string(),
              original: z.boolean(),
            }),
          ),
        })
        .parse(rawData)

      const title = data.titles.find((el) => !el.original)?.title
      if (!title) return

      message.reply({
        embeds: [{ description: title }],
        allowedMentions: {
          users: [],
          repliedUser: false,
        },
      })
    } catch {
      // Do nothing
    }
  },
)
