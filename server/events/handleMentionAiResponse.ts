import { Events } from "discord.js"

import { Emoji } from "~/constants"
import { createEvent } from "~/server/utils/event"
import { parseMentions } from "~/server/utils/message"
import { joinAsLines } from "~/server/utils/string"

export default createEvent(
  Events.MessageCreate,
  { productionOnly: false },
  async (context, message) => {
    if (message.author.bot) return
    if (!message.guild) return

    const mentionText = `<@${message.client.user.id}>`

    if (!message.content.startsWith(mentionText)) return

    const parsedContent = parseMentions(
      message.content.slice(mentionText.length),
      message.guild,
    ).trim()

    if (!parsedContent) {
      await message.react(Emoji.cross)
      return
    }

    let replyingToUsername: string | null = null
    let replyingToContent: string | null = null
    if (message.reference?.messageId) {
      try {
        const referencedMessage = await message.channel.messages.fetch(
          message.reference.messageId,
        )

        replyingToUsername = referencedMessage.author.username
        replyingToContent = referencedMessage.content
      } catch {
        // ignore
      }
    }

    try {
      await message.channel.sendTyping()

      const prompt =
        replyingToUsername && replyingToContent
          ? joinAsLines(
              `User ${replyingToUsername} said: "${replyingToContent}"`,
              `The current user asks: "${parsedContent}"`,
            )
          : parsedContent

      const response = await context.openAI.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "You are a robotic Discord bot. Be direct, concise, and accurate. Do not use emotional or flowery language.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_output_tokens: 300,
        temperature: 0.2,
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      await message.reply({
        content: response.output_text,
        allowedMentions: { repliedUser: false },
      })
    } catch (error) {
      console.error("Failed to handle mention AI response:", error)
      await message.react(Emoji.cross)
    }
  },
)
