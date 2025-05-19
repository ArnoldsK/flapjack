import { GuildMember } from "discord.js"
import { Repository } from "typeorm"

import { DISCORD_IDS, UPPER_CLASS_MESSAGE_CREDITS } from "~/constants"
import { appConfig } from "~/server/config"
import { db } from "~/server/database"
import { CreditsEntity } from "~/server/db/entity/Credits"

export interface Wallet {
  member: GuildMember
  credits: bigint
  updatedAt: Date
}

export class CreditsModel {
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
      updatedAt: entity?.updatedAt ?? new Date(),
    }
  }

  async addCredits(amount: bigint | number): Promise<Wallet> {
    const { member, credits } = await this.getWallet()

    const bigAmount: bigint =
      typeof amount === "bigint" ? amount : BigInt(Math.floor(amount))

    const newCredits = credits + bigAmount
    const newUpdatedAt = new Date()

    await this.#repository.upsert(
      [
        {
          userId: this.#member.id,
          credits: newCredits,
          updatedAt: newUpdatedAt,
        },
      ],
      ["userId"],
    )

    const newWallet: Wallet = {
      member,
      credits: newCredits,
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
        updatedAt: entity.updatedAt,
      }))
  }

  async #handleUpperClassRole(wallet: Wallet) {
    if (appConfig.dev) return

    const role = this.#member.guild.roles.cache.get(
      DISCORD_IDS.roles.upperClass,
    )
    if (!role) return

    await (wallet.credits >= UPPER_CLASS_MESSAGE_CREDITS ? this.#member.roles.add(role) : this.#member.roles.remove(role));
  }
}
