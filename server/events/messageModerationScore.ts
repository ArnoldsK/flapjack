import { Events } from "discord.js"
import { encodingForModel } from "js-tiktoken"
import OpenAI from "openai"

import { appConfig } from "../config"
import { createEvent } from "../utils/event"
import { parseMessageContentForAi } from "../utils/ai"
import { z } from "zod"
import ToxicScoreModel from "../models/ToxicScore"

const tokenEncoder = encodingForModel("gpt-4o-mini")

export default createEvent(
  Events.MessageCreate,
  { productionOnly: false },
  async (message) => {
    // Get member
    const member = message.member
    if (!member || member.user.bot) return

    // Prepare AI
    if (!appConfig.openAi.secretKey) return

    const ai = new OpenAI({
      apiKey: appConfig.openAi.secretKey,
      project: appConfig.openAi.projectId,
    })

    // Parse content
    const content = parseMessageContentForAi(message)
    if (!content) return

    // Get token count
    const tokenCount = tokenEncoder.encode(content).length
    if (tokenCount <= 1) return

    // Send the AI request
    const response = await ai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Moderate Latvian for toxicity/10. Only json with score and info",
        },
        {
          role: "user",
          content,
        },
      ],
    })

    try {
      // Parse the response
      const responseContent = response.choices[0].message.content!
      const result = z
        .object({
          score: z.number(),
          info: z.string(),
        })
        .parse(JSON.parse(responseContent))

      // Save the score
      const model = new ToxicScoreModel(message.member)
      await model.addScore({
        score: result.score,
        info: result.info,
      })
    } catch (err) {
      console.error("Failed to get an AI score result", JSON.stringify(err))
    }
  },
)
