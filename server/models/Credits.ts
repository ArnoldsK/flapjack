import { GuildMember } from "discord.js"
import { Repository } from "typeorm"
import { db } from "../database"
import CreditsEntity from "../entity/Credits"
import { appConfig, discordIds } from "../config"
import { getOrCreateRole } from "../utils/role"
import { UPPER_CLASS_MESSAGE_CREDITS } from "../constants"

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
    if (member.user.bot) {
      throw new Error("Not allowed for bots")
    }

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

  async addCredits(
    amount: bigint | number,
    bankedAmount: bigint | number = 0,
  ): Promise<Wallet> {
    const { member, credits, banked } = await this.getWallet()

    const bigAmount: bigint =
      typeof amount === "bigint" ? amount : BigInt(Math.floor(amount))
    const bigBankedAmount: bigint =
      typeof bankedAmount === "bigint"
        ? bankedAmount
        : BigInt(Math.floor(bankedAmount))

    const newCredits = credits + bigAmount
    const newBanked = banked + bigBankedAmount
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

    const newWallet: Wallet = {
      member,
      credits: newCredits,
      banked: newBanked,
      updatedAt: newUpdatedAt,
    }

    await this.#handleUpperClassRole(newWallet)

    return newWallet
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

  async #handleUpperClassRole(wallet: Wallet) {
    if (appConfig.dev) return

    const role = this.#member.guild.roles.cache.get(discordIds.roles.upperClass)
    if (!role) return

    const total = wallet.credits + wallet.banked
    if (total >= UPPER_CLASS_MESSAGE_CREDITS) {
      await this.#member.roles.add(role)
    } else {
      await this.#member.roles.remove(role)
    }
  }
}
