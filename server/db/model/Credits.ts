import { RequiredEntityData } from "@mikro-orm/core"
import { GuildMember } from "discord.js"

import {
  DISCORD_IDS,
  MIN_CREDITS_PER_MESSAGE,
  UPPER_CLASS_MESSAGE_CREDITS,
} from "~/constants"
import { BaseModel } from "~/server/base/Model"
import { appConfig } from "~/server/config"
import { CreditsEntity } from "~/server/db/entity/Credits"
import { assert } from "~/server/utils/error"

export interface Wallet {
  member: GuildMember
  credits: bigint
  lastMessageAt: Date | null
  updatedAt: Date
}

const parseEntityCredits = (
  entity: Pick<CreditsEntity, "credits" | "multiplier"> | null,
): bigint => {
  return (entity?.credits ?? 0n) * BigInt(entity?.multiplier ?? 1)
}

const getUpsertData = (
  userId: string,
  credits: bigint,
  lastMessageAt?: Date | null,
): RequiredEntityData<CreditsEntity> => ({
  userId,
  // Unsigned field allows only positive values
  credits: credits < 0n ? -credits : credits,
  multiplier: credits < 0n ? -1 : 1,
  lastMessageAt,
})

export class CreditsModel extends BaseModel {
  protected override Entity = CreditsEntity

  async getWallet(userId: string): Promise<Wallet> {
    const entity = await this.em.findOne(this.Entity, { userId })

    const member = this.context.guild().members.cache.get(userId)
    assert(!!member, "Member not found")

    return {
      member,
      credits: parseEntityCredits(entity),
      lastMessageAt: entity?.lastMessageAt ?? null,
      updatedAt: entity?.updatedAt ?? new Date(),
    }
  }

  async modifyBotCredits(byAmount: bigint) {
    const userId = this.context.guild().client.user.id
    const entity = await this.em.findOne(this.Entity, { userId })

    const newCredits = parseEntityCredits(entity) + byAmount

    await this.em.upsert(this.Entity, getUpsertData(userId, newCredits))
  }

  async modifyCredits({
    userId,
    byAmount,
    isCasino,
    timeBasedMessageAt,
  }: {
    userId: string
    byAmount: bigint | number
    /**
     * Is this credits transaction done in the casino?
     * Will modify bot credits with the opposite amount.
     */
    isCasino: boolean
    /**
     * When updating time-based message credits
     */
    timeBasedMessageAt?: Date
  }): Promise<Wallet> {
    const wallet = await this.getWallet(userId)

    const bigByAmount: bigint =
      typeof byAmount === "bigint" ? byAmount : BigInt(Math.floor(byAmount))

    // No update
    if (bigByAmount === 0n) {
      return wallet
    }

    const newCredits = wallet.credits + bigByAmount

    const entity = await this.em.upsert(
      this.Entity,
      getUpsertData(
        userId,
        newCredits,
        timeBasedMessageAt ?? wallet.lastMessageAt,
      ),
    )

    // Modify bot credits with the opposite amount
    if (isCasino) {
      try {
        await this.modifyBotCredits(-bigByAmount)
      } catch {
        // Should not fail the user credits add
        console.error("Failed to add bot credits")
      }
    }

    const newWallet: Wallet = {
      member: wallet.member,
      credits: parseEntityCredits(entity),
      lastMessageAt: entity.lastMessageAt,
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
        credits: parseEntityCredits(entity),
        lastMessageAt: entity.lastMessageAt,
        updatedAt: entity.updatedAt,
      }))
  }

  async #handleUpperClassRole(wallet: Wallet) {
    if (appConfig.dev) return
    if (wallet.member.user.bot) return

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

  async addMessageCredits({
    userId,
    messageAt,
  }: {
    userId: string
    messageAt: Date
  }): Promise<Wallet> {
    const wallet = await this.getWallet(userId)

    if (wallet.member.user.bot) {
      return wallet
    }

    const secondsSinceUpdate = wallet.lastMessageAt
      ? (messageAt.getTime() - wallet.lastMessageAt.getTime()) / 1000
      : 0
    const timeBasedAmount = Math.floor(secondsSinceUpdate * 0.2)

    return await this.modifyCredits({
      userId,
      byAmount: Math.max(MIN_CREDITS_PER_MESSAGE, timeBasedAmount),
      isCasino: false,
      timeBasedMessageAt: messageAt,
    })
  }
}
