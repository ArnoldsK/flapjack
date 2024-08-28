import OpenAI from "openai"

import { ToxicScoreModel } from "../models/ToxicScore"
import { AiTask } from "../types/tasks"
import { aiCustomId, parseAiBatchFileResponses } from "../utils/ai"
import { checkUnreachable } from "../utils/error"

export const aiHandleRemoteBatches: AiTask = async (_context, ai) => {
  const model = new ToxicScoreModel()
  const remoteBatchIds = await model.getUnhandledRemoteBatchIds()
  if (!remoteBatchIds.length) return

  await Promise.all(
    remoteBatchIds.map((batchId) => handleRemoteBatch({ ai, model, batchId })),
  )

  console.log("> AI > Handled remote batches")
}

const handleRemoteBatch = async ({
  ai,
  model,
  batchId,
}: {
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
  ai,
  model,
  fileId,
}: {
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
    }),
  )
}
