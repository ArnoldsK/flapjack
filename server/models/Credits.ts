import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../database"
import CreditsEntity from "../entity/Credits"

export interface Wallet {
  member: GuildMember
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
      member: this.#member,
      credits: entity?.credits ?? BigInt(0),
      banked: entity?.banked ?? BigInt(0),
      updatedAt: entity?.updatedAt ?? new Date(),
    }
  }

  async addCredits(amount: number, bankedAmount = 0): Promise<Wallet> {
    const { member, credits, banked } = await this.getWallet()
    const newCredits = credits + BigInt(Math.floor(amount))
    const newBanked = banked + BigInt(Math.floor(bankedAmount))
    const newUpdatedAt = new Date()

    await this.#repository.upsert(
      [
        {
          userId: this.#member.id,
          credits: newCredits,
          banked: newBanked,
          updatedAt: newUpdatedAt,
        },
      ],
      ["userId"],
    )

    return {
      member,
      credits: newCredits,
      banked: newBanked,
      updatedAt: newUpdatedAt,
    }
  }

  async getAllWallets(): Promise<Wallet[]> {
    const entities = await this.#repository.find()
    const members = this.#member.guild.members.cache

    return entities
      .filter((entity) => members.has(entity.userId))
      .map((entity) => ({
        member: members.get(entity.userId)!,
        credits: entity.credits,
        banked: entity.banked,
        updatedAt: entity.updatedAt,
      }))
  }
}
