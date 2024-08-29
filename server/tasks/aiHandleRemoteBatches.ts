import OpenAI from "openai"

import { ToxicScoreModel } from "../models/ToxicScore"
import { AiTask } from "../types/tasks"
import { parseAiBatchFileResponses } from "../utils/ai"
import { checkUnreachable } from "../utils/error"
import { BaseContext } from "../types"
import { appConfig } from "../config"
import { isTextChannel } from "../utils/channel"
import { dedupe } from "../utils/array"
import { isNonNullish } from "../utils/boolean"
import { ToxicUserFlagModel } from "../models/ToxicUserFlag"
import ToxicScoreEntity, { ToxicScoreStatus } from "../entity/ToxicScore"
import { joinAsLines } from "../utils/string"

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
        batchId,
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
  await model.updateByRemoteBatchId([batchId], {
    status: ToxicScoreStatus.Failed,
  })
}

const handleCompletedBatch = async ({
  context,
  ai,
  model,
  batchId,
  fileId,
}: {
  context: BaseContext
  ai: OpenAI
  model: ToxicScoreModel
  batchId: string
  fileId: string
}) => {
  // Parse response file
  const fileResponse = await ai.files.content(fileId)
  const fileContents = await fileResponse.text()
  const responses = parseAiBatchFileResponses(fileContents)

  // There should be only one response
  const response = responses[0]!
  const answer = response.response.body.choices[0].message.content.toLowerCase()

  // Get all used entities
  const entities = await model.getByRemoteBatchId([batchId])
  const entityUserIds = dedupe(entities.map((el) => el.userId))

  // Parse answer to get flagged user ids
  const flaggedUserIds = answer
    .split(",")
    .map((el) => el.trim())
    .map((partialId) => entityUserIds.find((id) => id.startsWith(partialId)))
    .filter(isNonNullish)

  const userFlagModel = new ToxicUserFlagModel()

  await Promise.all(
    entityUserIds.map(async (userId) => {
      const isToxic = flaggedUserIds.includes(userId)

      await userFlagModel.create({
        userId,
        isToxic,
      })

      if (isToxic) {
        await sendToxicMessageLog({
          context,
          userId,
          entities: entities.filter((el) => el.userId === userId),
        })
      }
    }),
  )

  // Set as completed
  await model.updateByRemoteBatchId([batchId], {
    status: ToxicScoreStatus.Completed,
    response: fileContents,
  })
}

const sendToxicMessageLog = async ({
  context,
  userId,
  entities,
}: {
  context: BaseContext
  userId: string
  entities: ToxicScoreEntity[]
}) => {
  const guild = context.client.guilds.cache.get(appConfig.discord.ids.guild)
  if (!guild) {
    console.error("> AI > Couldn't log > !guild")
    return
  }

  const member = guild.members.cache.get(userId)
  if (!member) {
    console.error("> AI > Couldn't log > !member")
    return
  }

  const firstEntity = entities.at(0)!
  const channel = guild.channels.cache.get(firstEntity.channelId)
  if (!channel) {
    console.error("> AI > Couldn't log > !channel")
    return
  }

  const logsChannel = guild.channels.cache.get(
    // ai-test-logs
    "1278435765105201163",
  )
  if (!isTextChannel(logsChannel)) {
    console.error("> AI > Couldn't log > !isTextChannel(logsChannel)")
    return
  }

  await logsChannel.send({
    embeds: [
      {
        title: "Flagged as toxic",
        author: {
          name: member.displayName,
          icon_url: member.displayAvatarURL({
            forceStatic: true,
            extension: "png",
            size: 64,
          }),
        },
        description: joinAsLines(
          `[#${channel.name}](${channel.url})`,
          ...entities.map((entity) => {
            return entity.content.split("\n").join("; ")
          }),
        ),
      },
    ],
  })
}
