import { Events, User } from "discord.js"
import { ResponseInputText } from "openai/resources/responses/responses"

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

    let replyingToUser: User | null = null
    let replyingToContent: string | null = null
    let replyingToImageUrl: string | null = null
    let previousQuestion: string | null = null
    if (message.reference?.messageId) {
      try {
        const referencedMessage = await message.channel.messages.fetch(
          message.reference.messageId,
        )

        // Message context
        replyingToUser = referencedMessage.author
        replyingToContent = parseMentions(
          referencedMessage.content,
          message.guild,
        ).trim()

        // Image context
        const firstImage = referencedMessage.attachments.find((attachment) =>
          attachment.contentType?.startsWith("image/"),
        )

        if (firstImage) {
          replyingToImageUrl = firstImage.url
        }

        // Bot context
        if (
          replyingToUser?.id === message.client.user.id &&
          referencedMessage.reference?.messageId
        ) {
          const secondReferencedMessage = await message.channel.messages.fetch(
            referencedMessage.reference.messageId,
          )

          previousQuestion = parseMentions(
            secondReferencedMessage.content,
            message.guild,
          ).trim()
        }
      } catch {
        // ignore
      }
    }

    try {
      await message.channel.sendTyping()

      const inputText = getInputText({
        parsedContent,
        replyingToUser,
        replyingToContent,
        previousQuestion,
      })

      const response = await context.openAI.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content:
              "You are a robotic Discord bot. Be concise, direct, and accurate. Respond with dry sarcasm, mild cynicism, and blunt honesty. Avoid flowery or emotional language. Reply in the same language the user used, supporting only English or Latvian.",
          },
          {
            role: "user",
            content: replyingToImageUrl
              ? [
                  inputText,
                  {
                    type: "input_image",
                    detail: "auto",
                    image_url: replyingToImageUrl,
                  },
                ]
              : inputText.text,
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

const getInputText = ({
  parsedContent,
  replyingToUser,
  replyingToContent,
  previousQuestion,
}: {
  parsedContent: string
  replyingToUser: User | null
  replyingToContent: string | null
  previousQuestion: string | null
}): ResponseInputText => {
  let text = parsedContent

  if (replyingToUser && replyingToContent) {
    if (previousQuestion) {
      text = joinAsLines(
        `The previous question was: "${previousQuestion}"`,
        `You said: "${replyingToContent}"`,
        `The current user asks: "${parsedContent}"`,
      )
    } else {
      text = joinAsLines(
        `User ${replyingToUser.username} said: "${replyingToContent}"`,
        `The current user asks: "${parsedContent}"`,
      )
    }
  }

  return {
    type: "input_text",
    text,
  }
}
