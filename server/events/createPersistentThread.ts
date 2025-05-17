import { Events } from "discord.js"
import { createEvent } from "../utils/event"
import { DISCORD_IDS } from "../../constants"
import { PERSISTENT_THREAD_ARCHIVE_DURATION } from "../../constants"
import { PersistentThreadModel } from "../db/model/PersistentThread"

const PERSISTENT_THREAD_CHANNEL_IDS = [DISCORD_IDS.channels.garage]

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (_context, message) => {
    if (message.author.bot) return
    if (!message.member) return

    // Verify channel
    const channel = message.channel
    if (!PERSISTENT_THREAD_CHANNEL_IDS.includes(channel.id)) return

    // Channel specific requirements
    if (channel.id === DISCORD_IDS.channels.garage) {
      // Require image in garage
      if (!message.attachments.size) return
    }

    // Create thread
    const mentioned = message.mentions.members?.first()?.displayName
    const threadName =
      mentioned || message.content.substring(0, 30) || "Discussion"

    const thread =
      message.thread ??
      (await message.startThread({
        autoArchiveDuration: PERSISTENT_THREAD_ARCHIVE_DURATION,
        name: threadName,
      }))

    // Upsert thread entity
    const model = new PersistentThreadModel()
    await model.upsert({
      channelId: channel.id,
      threadId: thread.id,
      messageId: message.id,
      userId: message.member.id,
    })
  },
)
