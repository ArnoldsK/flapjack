import OpenAI from "openai"

import { ToxicScoreModel } from "../models/ToxicScore"
import { AiTask } from "../types/tasks"
import { aiCustomId, parseAiBatchFileResponses } from "../utils/ai"
import { checkUnreachable } from "../utils/error"
import { BaseContext } from "../types"
import { appConfig } from "../config"
import { isTextChannel } from "../utils/channel"
import { TextChannel } from "discord.js"

export const aiHandleRemoteBatches: AiTask = async (context, ai) => {
  const model = new ToxicScoreModel()
  const remoteBatchIds = await model.getUnhandledRemoteBatchIds()
  if (!remoteBatchIds.length) return

  await Promise.all(
    remoteBatchIds.map((batchId) =>
      handleRemoteBatch({ context, ai, model, batchId }),
    ),
  )

  console.log("> AI > Handled remote batches")
}

const handleRemoteBatch = async ({
  context,
  ai,
  model,
  batchId,
}: {
  context: BaseContext
  ai: OpenAI
  model: ToxicScoreModel
  batchId: string
}) => {
  const batch = await ai.batches.retrieve(batchId)

  switch (batch.status) {
    case "cancelled":
    case "cancelling":
    case "failed":
    case "expired":
      await handleFailedBatch({ model, batchId })
      return

    case "completed":
      await handleCompletedBatch({
        context,
        ai,
        model,
        fileId: batch.output_file_id!,
      })
      return

    case "finalizing":
    case "in_progress":
    case "validating":
      // Ignore these
      return

    default:
      checkUnreachable(batch.status)
      return
  }
}

const handleFailedBatch = async ({
  model,
  batchId,
}: {
  model: ToxicScoreModel
  batchId: string
}) => {
  await model.deleteByRemoteBatchId([batchId])
}

const handleCompletedBatch = async ({
  context,
  ai,
  model,
  fileId,
}: {
  context: BaseContext
  ai: OpenAI
  model: ToxicScoreModel
  fileId: string
}) => {
  const fileResponse = await ai.files.content(fileId)
  const fileContents = await fileResponse.text()
  const responses = parseAiBatchFileResponses(fileContents)

  await Promise.all(
    responses.map(async (item) => {
      const { channelId, messageId } = aiCustomId.parse(item.custom_id)
      const answer = item.response.body.choices[0].message.content.toLowerCase()

      // Sometimes there's "Not enough info" and such, just check for "true"
      const isToxic = answer === "true"

      await model.setIsToxic({
        channelId,
        messageId,
        isToxic,
      })

      if (isToxic) {
        await sendToxicMessageLog({ context, model, channelId, messageId })
      }
    }),
  )
}

const sendToxicMessageLog = async ({
  context,
  model,
  channelId,
  messageId,
}: {
  context: BaseContext
  model: ToxicScoreModel
  channelId: string
  messageId: string
}) => {
  const entity = await model.getByMessageId({ channelId, messageId })
  if (!entity) return

  const guild = context.client.guilds.cache.get(appConfig.discord.ids.guild)
  if (!guild) return

  const member = guild.members.cache.get(entity.userId)
  if (!member) return

  const logsChannel = guild.channels.cache.get(
    // ai-test-logs
    "1278435765105201163",
  )
  if (!isTextChannel(logsChannel)) return

  const channel = guild.channels.cache.get(channelId) as TextChannel | undefined
  const message = channel?.messages.cache.get(messageId)

  await logsChannel.send({
    embeds: [
      {
        title: "Flagged as toxic",
        url: message?.url,
        author: {
          name: member.displayName,
          icon_url: member.displayAvatarURL({
            forceStatic: true,
            extension: "png",
            size: 64,
          }),
        },
        description: entity.content,
        footer: channel
          ? {
              text: `#${channel.name}`,
            }
          : undefined,
      },
    ],
  })
}
