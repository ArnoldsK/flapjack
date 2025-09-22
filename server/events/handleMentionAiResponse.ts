import { Events, Message, MessageType } from "discord.js"
import { ResponseInputText } from "openai/resources/responses/responses"

import { Emoji } from "~/constants"
import { isTextChannel } from "~/server/utils/channel"
import { createEvent } from "~/server/utils/event"
import { getOrFetchMessage, parseMentions } from "~/server/utils/message"
import { joinAsLines } from "~/server/utils/string"
import { BaseContext, Nullish } from "~/types"

type UserType = "I" | "Someone" | "You"

interface MessageData {
  userType: UserType
  content: string
}

const SYSTEM_PROMPT = [
  "You are a robotic Discord bot called Flapjack.",
  "Be concise, direct, and accurate.",
  "Respond with blunt honesty and minimal politeness.",
  "You may use profanity when it fits naturally.",
  "Avoid flowery or emotional language.",
  "Reply in the same language the user used, supporting only English or Latvian.",
].join(" ")

export default createEvent(
  Events.MessageCreate,
  { productionOnly: false },
  async (context, message) => {
    const { client, author, guild, channel } = message

    if (!guild) return
    if (author.bot) return
    if (!isTextChannel(channel)) return
    if (!(await getIsValidMessage(message))) return

    const currentContent = parseContent(context, message.content).trim()
    if (!currentContent) return

    let referencedMessage: Nullish<Message> = null
    try {
      referencedMessage = message.reference?.messageId
        ? await getOrFetchMessage(channel, message.reference.messageId)
        : null
    } catch {
      // Ignore
    }

    let replyingToName: Nullish<UserType> = null
    let replyingToContent: Nullish<string> = null
    let replyingToImageUrl: Nullish<string> = null
    if (referencedMessage) {
      replyingToName = parseUserType(referencedMessage.author.id, {
        currentUserId: author.id,
        clientUserId: client.user.id,
      })

      replyingToContent = parseContent(context, referencedMessage.content)

      if (referencedMessage.attachments.size > 0) {
        replyingToImageUrl = referencedMessage.attachments.find((attachment) =>
          attachment.contentType?.startsWith("image/"),
        )?.url
      }
    }

    const pastConversations = await getPastConversations(context, {
      referencedMessage,
      currentUserId: author.id,
    })

    try {
      await channel.sendTyping()

      const inputText = getInputText({
        currentContent,
        replyingToName,
        replyingToContent,
        pastConversations,
      })

      const response = await context.openAI.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: SYSTEM_PROMPT,
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

const getIsValidMessage = async (message: Message) => {
  if (message.content.startsWith(`<@${message.client.user.id}>`)) {
    return true
  }

  if (
    isTextChannel(message.channel) &&
    message.type === MessageType.Reply &&
    message.reference?.messageId &&
    message.mentions.users.has(message.client.user.id)
  ) {
    const referencedMessage = await getOrFetchMessage(
      message.channel,
      message.reference.messageId,
    )

    if (
      referencedMessage &&
      referencedMessage.type === MessageType.Reply &&
      referencedMessage.author.id === message.client.user.id
    ) {
      return true
    }
  }

  return false
}

const getInputText = ({
  currentContent,
  replyingToName,
  replyingToContent,
  pastConversations,
}: {
  currentContent: string
  replyingToName: Nullish<string>
  replyingToContent: Nullish<string>
  pastConversations: MessageData[]
}): ResponseInputText => {
  const conversation: string[] = pastConversations.map(
    (conversation) =>
      `${conversation.userType} said: "${conversation.content}"`,
  )

  if (replyingToName && replyingToContent) {
    conversation.push(`${replyingToName} said: "${replyingToContent}"`)
  }

  return {
    type: "input_text",
    text: joinAsLines(...conversation, currentContent),
  }
}

const parseContent = (context: BaseContext, content: string) => {
  const botMention = `<@${context.client.user!.id}>`

  return parseMentions(
    content.replaceAll(botMention, ""),
    context.guild(),
  ).trim()
}

const parseUserType = (
  userId: string,
  {
    currentUserId,
    clientUserId,
  }: {
    currentUserId: string
    clientUserId: string
  },
): UserType => {
  switch (userId) {
    case currentUserId: {
      return "I"
    }
    case clientUserId: {
      return "You"
    }
    default: {
      return "Someone"
    }
  }
}

const getPastConversations = async (
  context: BaseContext,
  {
    referencedMessage,
    currentUserId,
  }: {
    referencedMessage: Nullish<Message>
    currentUserId: string
  },
): Promise<MessageData[]> => {
  if (
    !referencedMessage ||
    referencedMessage.author.id !== referencedMessage.client.user.id
  ) {
    return []
  }

  const channel = referencedMessage.channel
  const clientUserId = referencedMessage.client.user.id

  if (!isTextChannel(channel)) {
    return []
  }

  const conversations: MessageData[] = []

  const handlePreviousMessage = async (messageId: Nullish<string>) => {
    if (!messageId) return

    const previousMessage = await getOrFetchMessage(channel, messageId)
    if (!previousMessage) return

    conversations.unshift({
      userType: parseUserType(previousMessage.author.id, {
        currentUserId,
        clientUserId,
      }),
      content: parseContent(context, previousMessage.content),
    })

    if (previousMessage.reference?.messageId) {
      // ! Recursion
      await handlePreviousMessage(previousMessage.reference.messageId)
    }
  }

  await handlePreviousMessage(referencedMessage.reference?.messageId)

  return conversations
}
