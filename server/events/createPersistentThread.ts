import { Events } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { PERSISTENT_THREAD_ARCHIVE_DURATION } from "~/constants"
import { PersistentThreadModel } from "~/server/db/model/PersistentThread"
import { createEvent } from "~/server/utils/event"

const PERSISTENT_THREAD_CHANNEL_IDS = new Set([DISCORD_IDS.channels.garage])

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (context, message) => {
    if (message.author.bot) return
    if (!message.member) return

    // Verify channel
    const channel = message.channel
    if (!PERSISTENT_THREAD_CHANNEL_IDS.has(channel.id)) return

    // Channel specific requirements
    if (
      channel.id === DISCORD_IDS.channels.garage && // Require image in garage
      message.attachments.size === 0
    )
      return

    // Create thread
    const mentioned = message.mentions.members?.first()?.displayName
    const threadName = mentioned || message.content.slice(0, 30) || "Discussion"

    const thread =
      message.thread ??
      (await message.startThread({
        autoArchiveDuration: PERSISTENT_THREAD_ARCHIVE_DURATION,
        name: threadName,
      }))

    // Upsert thread entity
    const model = new PersistentThreadModel(context)
    await model.upsert({
      channelId: channel.id,
      threadId: thread.id,
      messageId: message.id,
      userId: message.member.id,
    })
  },
)
