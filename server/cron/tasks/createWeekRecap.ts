import path from "node:path"

import { Attachment, Guild, Message, TextChannel } from "discord.js"

import {
  DISCORD_IDS,
  RECAP_CHANNEL_IDS,
  RECAP_PRIVATE_CHANNEL_IDS,
} from "~/constants"
import { appConfig } from "~/server/config"
import { StaticModel } from "~/server/db/model/Static"
import { isTextChannel } from "~/server/utils/channel"
import { d } from "~/server/utils/date"
import { assert } from "~/server/utils/error"
import {
  hostingDeleteAllFiles,
  hostingUploadUrlFile,
} from "~/server/utils/hosting"
import { isDiscordAttachmentUrl } from "~/server/utils/web"
import { StaticDataType } from "~/types/entity"
import { WeekRecapData } from "~/types/recap"
import { Task } from "~/types/tasks"

type RecapMessageData = WeekRecapData["messages"][number]

export const createWeekRecap: Task = async (context) => {
  const guild = context.guild()

  const weekMessages = await getWeekMessages(guild)
  if (weekMessages.length === 0) {
    console.log("> Recap > No messages found")
    return
  }

  let recapMessages = await Promise.all(weekMessages.map(parseRecapMessage))
  recapMessages = parseMessageDataReactions(recapMessages)
  recapMessages = await uploadMessageDataAttachments(recapMessages)
  if (recapMessages.length === 0) {
    console.log("> Recap > No messages found after filtering")
    return
  }

  const model = new StaticModel(StaticDataType.WeekRecap)
  await model.set({
    createdAt: new Date(),
    messages: recapMessages,
  })

  await sendAnnouncement(guild)
}

const fetchMessagesUntil = async (
  channel: TextChannel,
  endDate: Date,
  lastId?: string,
): Promise<Message[]> => {
  const messages: Message[] = [
    ...(await channel.messages.fetch({ limit: 100, before: lastId })).values(),
  ]

  for (let i = 0; i < messages.length; i++) {
    if (messages[i].createdAt.getTime() < endDate.getTime()) {
      return messages.slice(0, i)
    }
  }

  if (messages.length === 0) {
    return messages
  }

  return [
    ...messages,
    ...(await fetchMessagesUntil(channel, endDate, messages.at(-1)?.id)),
  ]
}

const getWeekMessages = async (guild: Guild): Promise<Message[]> => {
  const endDate = d()
    .subtract(1, appConfig.dev ? "day" : "week")
    .toDate()

  const messageGroups = await Promise.all(
    guild.channels.cache
      .filter(
        (channel): channel is TextChannel =>
          isTextChannel(channel) && RECAP_CHANNEL_IDS.includes(channel.id),
      )
      .map((channel) => {
        console.log("> Recap > Fetching messages for", channel.name)
        return fetchMessagesUntil(channel, endDate)
      }),
  )

  return messageGroups
    .flat()
    .filter(
      (message) => !message.system && !message.author.bot && message.member,
    )
}

const parseAttachment = (
  attachment:
    | (Pick<Attachment, "id" | "url"> &
        Partial<Pick<Attachment, "contentType">>)
    | undefined,
): RecapMessageData["firstAttachment"] => {
  if (!attachment) {
    return null
  }

  const url = attachment.url
  const isImage =
    !!attachment.contentType?.startsWith("image/") ||
    /(?:png|jpe?g|gif)/i.test(url)
  const isVideo =
    !!attachment.contentType?.startsWith("video/") ||
    /(?:mp4|mov|webm)/i.test(url)

  return {
    id: attachment.id,
    isImage,
    isVideo,
    url,
  }
}

const parseRecapMessage = async (
  message: Message,
): Promise<RecapMessageData> => {
  const guild = message.guild
  assert(!!guild, "Guild is not defined")
  const channel = message.channel
  assert(isTextChannel(channel), "Channel is not a text channel")
  const member = message.member
  assert(!!member, "Member is not defined")

  const isPrivate = RECAP_PRIVATE_CHANNEL_IDS.includes(channel.id)

  return {
    id: message.id,
    createdAt: message.createdAt,
    content: isPrivate ? "" : message.cleanContent.trim(),
    firstAttachment: isPrivate
      ? null
      : parseAttachment(message.attachments.first()),
    guild: {
      id: guild.id,
    },
    channel: {
      id: channel.id,
      name: channel.name,
    },
    member: {
      id: member.id,
      displayName: member.nickname || member.displayName,
      username: member.user.username,
    },
    reactions: message.reactions.cache.map((reaction) => ({
      emoji: {
        identifier: reaction.emoji.identifier,
        id: reaction.emoji.id,
        name: reaction.emoji.name,
        url: reaction.emoji.imageURL(),
      },
      count: reaction.count,
    })),
    // Will be resolved after
    reactionCount: 0,
  }
}

const parseMessageDataReactions = (
  messages: RecapMessageData[],
): RecapMessageData[] => {
  return (
    messages
      .map((message) => ({
        ...message,
        reactionCount: (message.reactionCount = message.reactions.reduce(
          (c, r) => c + r.count,
          0,
        )),
      }))
      // Remove stale messages
      .filter((el) => el.reactionCount >= 3)
  )
}

const getUrlFileExtension = (fileUrl: string): string => {
  const url = new URL(fileUrl)
  return path.extname(url.pathname)
}

const uploadMessageDataAttachments = async (
  messages: RecapMessageData[],
): Promise<RecapMessageData[]> => {
  // Upload attachments to hosting and update URLs
  try {
    await hostingDeleteAllFiles()

    return await Promise.all(
      messages.map(async (message) => {
        let attachment = message.firstAttachment
        // Use the message content if it contains just the attachment url
        if (!attachment && isDiscordAttachmentUrl(message.content)) {
          attachment = parseAttachment({
            id: message.id,
            url: message.content,
          })
          message.content = ""
        }

        // Upload to hosting
        if (attachment) {
          const [hostedFile] = await hostingUploadUrlFile([
            {
              filename: attachment.id + getUrlFileExtension(attachment.url),
              url: attachment.url,
            },
          ])

          if (hostedFile) {
            attachment.url = hostedFile.url
          } else {
            // No attachment; keep the url but set both flags to false
            attachment.isImage = false
            attachment.isVideo = false
          }

          message.firstAttachment = attachment
        }

        return message
      }),
    )
  } catch (error) {
    console.error("> Failed to upload images to CDN", error)
    return messages
  }
}

const sendAnnouncement = async (guild: Guild) => {
  // Announce if there are messages
  const channel = guild.channels.cache.get(
    DISCORD_IDS.channels.announcements,
  ) as TextChannel | undefined

  if (channel && !appConfig.dev) {
    const content = "New weekly recap at https://pepsidog.lv/recap"

    // Find the previous message
    const messages = await channel.messages.fetch({ limit: 20 })
    const message = messages.find(
      (el) => el.author.id === guild.client.user.id && el.content === content,
    )

    // Delete the previous message
    if (message) {
      await message.delete()
    }

    // Send a new message
    await channel.send(content)
  }
}
