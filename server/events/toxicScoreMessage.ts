import { ChannelType, Events } from "discord.js"
import { encodingForModel } from "js-tiktoken"

import { createEvent } from "../utils/event"
import { parseMessageContentForAi } from "../utils/ai"
import { ToxicScoreModel } from "../models/ToxicScore"
import { appConfig } from "../config"

const tokenEncoder = encodingForModel("gpt-4o-mini")

const channelIds = appConfig.discord.ids.channels
const IGNORE_CHANNEL_IDS = [
  channelIds.casino,
  channelIds.copyPasta,
  channelIds.nsfw,
  channelIds.vTubers,
  channelIds.numbersGame,
  channelIds.upperClass,
]

export default createEvent(
  Events.MessageCreate,
  { productionOnly: false },
  async (message) => {
    // Get member
    const member = message.member
    if (!member || member.user.bot) return

    // Allowed channels
    if (
      message.channel.type !== ChannelType.GuildText ||
      IGNORE_CHANNEL_IDS.includes(message.channel.id)
    )
      return

    // Parse content
    const content = parseMessageContentForAi(message)
    if (!content) return

    // Get token count
    const tokenCount = tokenEncoder.encode(content).length
    if (tokenCount <= 1) return

    // Add to batch list
    const model = new ToxicScoreModel()
    await model.create({
      userId: message.author.id,
      channelId: message.channel.id,
      messageId: message.id,
      content,
    })
  },
)
