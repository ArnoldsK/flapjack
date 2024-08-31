import { createReadStream, unlinkSync, writeFileSync } from "fs"

import { ToxicScoreModel } from "../models/ToxicScore"
import { AiTask } from "../types/tasks"
import { aiCustomId, getAiBatchTmpFilePath } from "../utils/ai"
import ToxicScoreEntity from "../entity/ToxicScore"

const MIN_BATCH_SIZE = 20

export const entitiesToBatch = (entities: ToxicScoreEntity[]): string => {
  const prompt =
    "Ziņas latviski starp lietotājiem, vecākās pirmās. Izvērtē kurš lietotājs uzvedas agresīvi un uzbrūkoši pret citiem. Atgriezt ar komatiem atdalītus lietotāja ID."
  const content = entities
    .map((entity) => {
      const userId = entity.userId.substring(0, 4)
      return `${userId}: ${entity.content.split("\n").join("; ")}`
    })
    .join("\n")

  const oldestEntity = entities.at(0)!
  const newestEntity = entities.at(-1)!

  return JSON.stringify({
    custom_id: aiCustomId.get({
      oldestEntityId: oldestEntity.id,
      newestEntityId: newestEntity.id,
    }),
    method: "POST",
    url: "/v1/chat/completions",
    body: {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: prompt,
        },
        {
          role: "user",
          content,
        },
      ],
    },
  })
}

export const aiCreateRemoteBatches: AiTask = async (_context, ai) => {
  const model = new ToxicScoreModel()

  // Get unsent batches
  const unsentBatches = await model.getAllUnsent()
  if (unsentBatches.length < MIN_BATCH_SIZE) return

  // Create and upload batch data
  const filePath = getAiBatchTmpFilePath()
  writeFileSync(filePath, entitiesToBatch(unsentBatches))

  const file = await ai.files.create({
    file: createReadStream(filePath),
    purpose: "batch",
  })

  const remoteBatch = await ai.batches.create({
    input_file_id: file.id,
    endpoint: "/v1/chat/completions",
    completion_window: "24h",
  })

  // Update entities with remote batch ids
  await model.setRemoteBatchId(
    unsentBatches.map((el) => el.id),
    remoteBatch.id,
  )

  // Delete the local file since it won't be used anymore
  unlinkSync(filePath)

  console.log("> AI > Created a remote batch of", unsentBatches.length)
}
