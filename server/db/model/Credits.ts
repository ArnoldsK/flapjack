import { GuildMember } from "discord.js"

import { DISCORD_IDS, UPPER_CLASS_MESSAGE_CREDITS } from "~/constants"
import { BaseModel } from "~/server/base/Model"
import { appConfig } from "~/server/config"
import { CreditsEntity } from "~/server/db/entity/Credits"
import { assert } from "~/server/utils/error"

export interface Wallet {
  member: GuildMember
  credits: bigint
  updatedAt: Date
}

export class CreditsModel extends BaseModel {
  protected override Entity = CreditsEntity

  async getWallet(userId: string): Promise<Wallet> {
    const entity = await this.em.findOne(this.Entity, { userId })

    const member = this.context.guild().members.cache.get(userId)
    assert(!!member, "Member not found")

    return {
      member,
      credits: entity?.credits ?? BigInt(0),
      updatedAt: entity?.updatedAt ?? new Date(),
    }
  }

  async addCredits(userId: string, amount: bigint | number): Promise<Wallet> {
    const { member, credits } = await this.getWallet(userId)

    const bigAmount: bigint =
      typeof amount === "bigint" ? amount : BigInt(Math.floor(amount))

    const newCredits = credits + bigAmount

    const entity = await this.em.upsert(this.Entity, {
      userId,
      credits: newCredits,
    })

    const newWallet: Wallet = {
      member,
      credits: newCredits,
      updatedAt: entity.updatedAt,
    }

    await this.#handleUpperClassRole(newWallet)

    return newWallet
  }

  async getAllWallets(): Promise<Wallet[]> {
    const entities = await this.em.findAll(this.Entity)
    const members = this.context.guild().members.cache

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

    const role = this.context
      .guild()
      .roles.cache.get(DISCORD_IDS.roles.upperClass)
    if (!role) return

    await (wallet.credits >= UPPER_CLASS_MESSAGE_CREDITS
      ? wallet.member.roles.add(role)
      : wallet.member.roles.remove(role))
  }

  async removeAll() {
    await this.em.nativeDelete(this.Entity, {})
  }
}
