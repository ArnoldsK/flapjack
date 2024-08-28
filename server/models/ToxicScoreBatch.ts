import { IsNull, Not, Repository } from "typeorm"
import { db } from "../database"
import ToxicScoreBatchEntity from "../entity/ToxicScoreBatch"

export interface ToxicScoreBatchInput {
  messageId: string
  content: string
}

export default class ToxicScoreBatchBatchModel {
  #repository: Repository<ToxicScoreBatchEntity>

  constructor() {
    this.#repository = db.getRepository(ToxicScoreBatchEntity)
  }

  async addBatch(input: ToxicScoreBatchInput) {
    await this.#repository
      .create({
        body: JSON.stringify({
          custom_id: input.messageId,
          method: "POST",
          url: "/v1/chat/completions",
          body: {
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: "Moderate Latvian for toxicity/10. Give only boolean.",
              },
              {
                role: "user",
                content: input.content,
              },
            ],
          },
        }),
        createdAt: new Date(),
      })
      .save()
  }

  async getNextBatches() {
    // Get unsent
    const entities = await this.#repository.find({
      where: { sent: 0 },
    })

    // Set as sent
    await this.#repository.update(
      entities.map((el) => el.id),
      { sent: 1 },
    )

    return entities
  }

  async setRemoteBatchId(entityIds: string[], remoteBatchId: string) {
    await this.#repository.update(entityIds, {
      remoteBatchId,
    })
  }

  async getRemoteBatchIds(): Promise<string[]> {
    const entities = await this.#repository.find({
      where: {
        sent: 1,
        remoteBatchId: Not(IsNull()),
      },
    })

    return entities
      .map((el) => el.remoteBatchId)
      .filter((id): id is string => !!id)
  }
}
