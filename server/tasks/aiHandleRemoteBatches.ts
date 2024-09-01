import OpenAI from "openai"

import { ToxicScoreModel } from "../models/ToxicScore"
import { AiTask } from "../types/tasks"
import { parseAiBatchFileResponses } from "../utils/ai"
import { checkUnreachable } from "../utils/error"
import { BaseContext } from "../types"
import { dedupe } from "../utils/array"
import { ToxicUserFlagModel } from "../models/ToxicUserFlag"
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
  const answer = response.response.body.choices[0].message.content

  // Get all used entities
  const entities = await model.getByRemoteBatchId([batchId])
  const entityUserIds = dedupe(entities.map((el) => el.userId))

  // Parse answer to get flagged user ids
  const flaggedUsers: Array<{ userId: string; reason: string }> = []
  try {
    const items = JSON.parse(answer)

    for (const item of items) {
      const userId = entityUserIds.find((id) => id.startsWith(item.user))
      if (!userId) continue

      flaggedUsers.push({
        userId,
        reason: item.reason,
      })
    }
  } catch (error) {
    console.error(
      "> AI > Unable to parse the answer",
      JSON.stringify({ error, answer }),
    )
  }

  // Create user flag entities
  const userFlagModel = new ToxicUserFlagModel()
  await Promise.all(
    entityUserIds.map(async (userId) => {
      const flaggedUser = flaggedUsers.find((el) => el.userId === userId)

      await userFlagModel.create({
        userId,
        isToxic: !!flaggedUser,
        info: flaggedUser?.reason ?? "",
      })
    }),
  )

  // Set as completed
  await model.updateByRemoteBatchId([batchId], {
    status: ToxicScoreStatus.Completed,
    response: fileContents,
  })
}
