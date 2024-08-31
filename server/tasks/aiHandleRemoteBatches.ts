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
import {
  ToxicUserFlagCreateOrUpdateResult,
  ToxicUserFlagModel,
} from "../models/ToxicUserFlag"
import { ToxicScoreStatus } from "../entity/ToxicScore"

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
      const entity = await userFlagModel.createOrUpdate({
        userId,
        isToxic,
      })

      if (isToxic) {
        await sendFlaggedLog(context, entity)
      }
    }),
  )

  // Set as completed
  await model.updateByRemoteBatchId([batchId], {
    status: ToxicScoreStatus.Completed,
    response: fileContents,
  })
}

export const sendFlaggedLog = async (
  context: BaseContext,
  entity: ToxicUserFlagCreateOrUpdateResult,
) => {
  const guild = context.client.guilds.cache.get(appConfig.discord.ids.guild)!
  const channel = guild.channels.cache.get(appConfig.discord.ids.channels.logs)
  if (!isTextChannel(channel)) return

  const member = guild.members.cache.get(entity.userId)
  if (!member) return

  await channel.send({
    embeds: [
      {
        title: "Flagged as toxic",
        author: {
          name: member.displayName,
          icon_url: member.displayAvatarURL({
            extension: "png",
            forceStatic: true,
            size: 32,
          }),
        },
        footer:
          entity.toxicInARow > 1
            ? {
                text: `Flagged ${entity.toxicInARow} times in a row`,
              }
            : undefined,
      },
    ],
  })
}
