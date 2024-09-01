import { In, IsNull, Not, Repository } from "typeorm"
import { db } from "../database"
import ToxicScoreEntity, { ToxicScoreStatus } from "../entity/ToxicScore"
import { dedupe } from "../utils/array"

export class ToxicScoreModel {
  #repository: Repository<ToxicScoreEntity>

  constructor() {
    this.#repository = db.getRepository(ToxicScoreEntity)
  }

  async create(input: {
    userId: string
    channelId: string
    messageId: string
    content: string
  }) {
    await this.#repository
      .create({
        userId: input.userId,
        channelId: input.channelId,
        messageId: input.messageId,
        content: input.content,
        createdAt: new Date(),
      })
      .save()
  }

  async getAllUnsent() {
    return await this.#repository.find({
      where: {
        remoteBatchId: IsNull(),
        status: IsNull(),
      },
      order: {
        createdAt: "asc",
      },
    })
  }

  async setRemoteBatchId(entityIds: string[], remoteBatchId: string) {
    if (!entityIds.length) return

    await this.#repository.update(entityIds, {
      remoteBatchId,
    })
  }

  async updateByRemoteBatchId(
    remoteBatchIds: string[],
    data: Partial<ToxicScoreEntity>,
  ) {
    if (!remoteBatchIds.length) return

    await this.#repository.update({ remoteBatchId: In(remoteBatchIds) }, data)
  }

  async getUnhandledRemoteBatchIds(): Promise<string[]> {
    const entities = await this.#repository.find({
      where: {
        remoteBatchId: Not(IsNull()),
        status: IsNull(),
      },
    })

    // TypeORM doesn't support groupBy in find() and I don't wanna use QueryBuilder...
    return dedupe(
      entities.map((el) => el.remoteBatchId).filter((id): id is string => !!id),
    )
  }

  // async deleteByRemoteBatchId(remoteBatchIds: string[]) {
  //   if (!remoteBatchIds.length) return

  //   await this.#repository.delete({
  //     remoteBatchId: In(remoteBatchIds),
  //   })
  // }

  async getByRemoteBatchId(remoteBatchIds: string[]) {
    return await this.#repository.find({
      where: {
        remoteBatchId: In(remoteBatchIds),
      },
    })
  }

  async getByMessageId(input: { channelId: string; messageId: string }) {
    return await this.#repository.findOne({
      where: {
        channelId: input.channelId,
        messageId: input.messageId,
      },
    })
  }
}
