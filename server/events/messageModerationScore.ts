import { Events } from "discord.js"
import { encodingForModel } from "js-tiktoken"

import { createEvent } from "../utils/event"
import { parseMessageContentForAi } from "../utils/ai"
import { ToxicScoreModel } from "../models/ToxicScore"

const tokenEncoder = encodingForModel("gpt-4o-mini")

export default createEvent(
  Events.MessageCreate,
  { productionOnly: false },
  async (message) => {
    // Get member
    const member = message.member
    if (!member || member.user.bot) return

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
