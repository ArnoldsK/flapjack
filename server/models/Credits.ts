import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../database"
import CreditsEntity from "../entity/Credits"

export interface Wallet {
  credits: bigint
  banked: bigint
  updatedAt: Date
}

export default class CreditsModel {
  #member: GuildMember
  #repository: Repository<CreditsEntity>

  constructor(member: GuildMember) {
    this.#member = member
    this.#repository = db.getRepository(CreditsEntity)
  }

  async getWallet(): Promise<Wallet> {
    const entity = await this.#repository.findOne({
      where: {
        userId: this.#member.id,
      },
    })

    return {
      credits: entity?.credits ?? BigInt(0),
      banked: entity?.banked ?? BigInt(0),
      updatedAt: entity?.updatedAt ?? new Date(),
    }
  }

  async addCredits(amount: number, bankedAmount = 0) {
    const { credits, banked } = await this.getWallet()

    await this.#repository.upsert(
      [
        {
          userId: this.#member.id,
          credits: credits + BigInt(amount),
          banked: banked + BigInt(bankedAmount),
        },
      ],
      ["userId"],
    )
  }
}
