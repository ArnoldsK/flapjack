import { RequiredEntityData } from "@mikro-orm/core"
import { APIEmbedThumbnail, AttachmentBuilder, GuildMember } from "discord.js"

import { BaseModel } from "~/server/base/Model"
import { CacheKey } from "~/server/cache"
import { getGearImage } from "~/server/canvas/gearImage"
import { getOsrsPrices } from "~/server/cron/tasks/getOsrsPrices"
import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { StaticDataModel } from "~/server/db/model/StaticData"
import { StaticDataType } from "~/types/entity"
import { GearSlot } from "~/types/osrs"

export interface OsrsItemsEmbedData {
  thumbnail: APIEmbedThumbnail
  files: AttachmentBuilder[]
}

export class OsrsItemSlotError extends Error {}

export class GearModel extends BaseModel {
  protected override Entity = OsrsItemsEntity

  async getItems(userId: string): Promise<OsrsItemsEntity[]> {
    return await this.em.find(this.Entity, { userId })
  }

  async getItemsWithEmbed(
    member: GuildMember,
  ): Promise<OsrsItemsEmbedData & { items: OsrsItemsEntity[] }> {
    const items = await this.getItems(member.id)
    const image = await this.#getCachedGearImage(member, items)

    return {
      items,
      thumbnail: {
        url: "attachment://gear.png",
      },
      files: [new AttachmentBuilder(image, { name: "gear.png" })],
    }
  }

  async #getCachedGearImage(
    member: GuildMember,
    items: OsrsItemsEntity[],
  ): Promise<Buffer> {
    const cachedImageByUserId = this.context.cache.get(CacheKey.UserGearImage)

    // Use cached
    const cachedImage = cachedImageByUserId.get(member.id)
    if (cachedImage) {
      return cachedImage
    }

    const image = await getGearImage({ items })

    // Update user cache
    cachedImageByUserId.set(member.id, image)

    return image
  }

  async addItem(input: RequiredEntityData<OsrsItemsEntity>) {
    const items = await this.getItems(input.userId)
    const slotError = this.getSlotError({
      slot: input.itemSlot,
      items,
    })

    if (slotError) {
      throw new OsrsItemSlotError(slotError)
    }

    await this.em.create(this.Entity, input)
    await this.em.flush()

    // Clear user cache
    const cachedImageByUserId = this.context.cache.get(CacheKey.UserGearImage)
    cachedImageByUserId.uns(input.userId)
  }

  async removeItem(input: { userId: string; itemId: number }) {
    await this.em.nativeDelete(this.Entity, {
      userId: input.userId,
      itemId: input.itemId,
    })

    // Clear user cache
    const cachedImageByUserId = this.context.cache.get(CacheKey.UserGearImage)
    cachedImageByUserId.uns(input.userId)
  }

  async getPriceByItemIdMap(): Promise<Map<number, number>> {
    const model = new StaticDataModel(this.context)
    const data = await model.get(StaticDataType.OsrsPrices)

    if (!data) {
      return await getOsrsPrices(this.context)
    }

    return new Map(data.items)
  }

  getSlotError({
    slot,
    items,
  }: {
    slot: GearSlot
    items: OsrsItemsEntity[]
  }): string | undefined {
    const itemBySlot = new Map(items.map((item) => [item.itemSlot, true]))

    if (itemBySlot.has(slot)) {
      return "Sell your current item to replace"
    }

    if (
      slot === GearSlot.TwoHanded &&
      (itemBySlot.has(GearSlot.OneHanded) || itemBySlot.has(GearSlot.Shield))
    ) {
      return "Already using a weapon or a shield"
    }

    if (
      (slot === GearSlot.Shield || slot === GearSlot.OneHanded) &&
      itemBySlot.has(GearSlot.TwoHanded)
    ) {
      return "You're using a two-handed weapon"
    }

    return undefined
  }
}
