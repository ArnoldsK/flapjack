import { Events, Message, MessageType } from "discord.js"
import {
  ResponseInputItem,
  ResponseInputText,
} from "openai/resources/responses/responses"

import { Emoji } from "~/constants"
import { appConfig } from "~/server/config"
import { isTextChannel } from "~/server/utils/channel"
import { d } from "~/server/utils/date"
import { createEvent } from "~/server/utils/event"
import { getOrFetchMessage, parseMentions } from "~/server/utils/message"
import { joinAsLines } from "~/server/utils/string"
import { BaseContext, Nullish } from "~/types"

type UserType = "I" | "Someone" | "You"

interface MessageData {
  userType: UserType
  content: string
}

const getSystemPrompt = ({ hasSearch }: { hasSearch: boolean }) =>
  [
    "You are a robotic Discord bot called Flapjack.",
    "Be concise, direct, and accurate.",
    "Respond with blunt honesty and minimal politeness.",
    "You may use profanity when it fits naturally.",
    "Avoid flowery or emotional language.",
    "Reply in the same language the user used, supporting only English or Latvian.",
    `The current date and time in Europe/Riga is: ${d().tz("Europe/Riga").format("YYYY-MM-DD HH:mm:ss")}`,
    hasSearch
      ? "You must **answer strictly using the following search results**. Do not use your training data. If the results conflict, indicate the conflict and prefer the most recent or authoritative source."
      : null,
  ]
    .filter(Boolean)
    .join(" ")

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

    const inputText = getInputText({
      currentContent,
      replyingToName,
      replyingToContent,
      pastConversations,
    })

    let searchQuery = ""
    let searchContext = ""
    try {
      const searchDecision = await getSearchDecisionAndQuery(
        context,
        inputText.text,
      )

      if (searchDecision.needsSearch && searchDecision.query) {
        searchQuery = searchDecision.query
        searchContext = await getSearchContext(searchDecision.query)
      }
    } catch (error) {
      console.error("Web search failed:", error)
    }

    try {
      await channel.sendTyping()

      const response = await context.openAI.responses.create({
        model: "gpt-4o-mini",
        input: [
          {
            role: "system",
            content: getSystemPrompt({ hasSearch: Boolean(searchContext) }),
          } satisfies ResponseInputItem,
          ...((searchContext
            ? [
                {
                  role: "system",
                  content: `Search results:\n${searchContext}`,
                },
              ]
            : []) satisfies ResponseInputItem[]),
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
          } satisfies ResponseInputItem,
        ],
        max_output_tokens: 300,
        temperature: 0.2,
      })

      if (response.error) {
        throw new Error(response.error.message)
      }

      await message.reply({
        content: joinAsLines(
          searchQuery ? `-# 🔍︎ ${searchQuery}` : null,
          response.output_text,
        ),
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
    text:
      conversation.length > 0
        ? joinAsLines(...conversation, "---", currentContent)
        : currentContent,
  }
}

const parseContent = (context: BaseContext, content: string) => {
  const botMention = `<@${context.client.user!.id}>`

  return parseMentions(
    content
      .replaceAll(botMention, "")
      .split("\n")
      // Remove lines starting with -# (search context)
      .filter((el) => el.startsWith("-#"))
      .join("\n"),
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

  return conversations.filter((el) => !!el.content)
}

const getSearchDecisionAndQuery = async (
  context: BaseContext,
  content: string,
): Promise<{ needsSearch: boolean; query?: string }> => {
  const classify = await context.openAI.responses.create({
    model: "gpt-4o-mini",
    input: [
      {
        role: "system",
        content: [
          "You are a classifier and search-query generator.",
          "Decide if the user's message requires up-to-date or realtime information from the internet.",
          `The current date and time in Europe/Riga is: ${d().tz("Europe/Riga").format("YYYY-MM-DD HH:mm:ss")}`,
          "Answer strictly in JSON with two fields: { needsSearch: 'yes' or 'no', query: 'a concise search query if needsSearch is yes, otherwise empty string' }",
          "Do not include any extra commentary.",
        ].join(" "),
      },
      { role: "user", content },
    ],
    max_output_tokens: 64,
    temperature: 0,
  })

  try {
    const json = JSON.parse(classify.output_text.trim())

    return {
      needsSearch: json.needsSearch === "yes",
      query: json.query || undefined,
    }
  } catch {
    return { needsSearch: false } // fallback
  }
}

const getSearchContext = async (query: string): Promise<string> => {
  if (!appConfig.google.apiKey || !appConfig.google.cseId) {
    throw new Error("Google API key or CSE ID is not configured.")
  }

  const url = new URL("https://www.googleapis.com/customsearch/v1")
  url.searchParams.append("key", appConfig.google.apiKey)
  url.searchParams.append("cx", appConfig.google.cseId)
  url.searchParams.append("q", query)
  url.searchParams.append("hl", "en")
  url.searchParams.append("num", "3")

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Google search failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  // Extract snippets for context
  const items = data.items || []
  const snippets = items
    // TODO: add zod validation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((item: any) => `${item.title}: ${item.snippet}`)
    .slice(0, 3)

  return snippets.join("\n")
}
