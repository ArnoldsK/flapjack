import { ChannelType, Events } from "discord.js"
import { encodingForModel } from "js-tiktoken"

import { createEvent } from "../utils/event"
import { parseMessageContentForAi } from "../utils/ai"
import { ToxicScoreModel } from "../models/ToxicScore"
import { appConfig } from "../config"

const tokenEncoder = encodingForModel("gpt-4o-mini")

// const ids = appConfig.discord.ids
// const IGNORED_CHANNEL_IDS = [
//   ids.channels.casino,
//   ids.channels.copyPasta,
//   ids.channels.nsfw,
//   ids.channels.vTubers,
//   ids.channels.numbersGame,
//   ids.channels.upperClass,
// ]
// const IGNORED_CATEGORY_IDS = [ids.categories.moderation]

export default createEvent(
  Events.MessageCreate,
  { productionOnly: true },
  async (message) => {
    // Get member
    const member = message.member
    if (!member || member.user.bot) return

    // Limit to general
    if (message.channel.id !== appConfig.discord.ids.channels.general) return

    // // Allowed channels
    // if (
    //   message.channel.type !== ChannelType.GuildText ||
    //   IGNORED_CHANNEL_IDS.includes(message.channel.id)
    // )
    //   return

    // // Allowed categories
    // if (
    //   message.channel.parentId &&
    //   IGNORED_CATEGORY_IDS.includes(message.channel.parentId)
    // )
    //   return

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
