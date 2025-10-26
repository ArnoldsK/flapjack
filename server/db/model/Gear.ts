import { RequiredEntityData } from "@mikro-orm/core"
import { APIEmbedThumbnail, AttachmentBuilder, GuildMember } from "discord.js"

import { osrsItemByLcName } from "~/constants/osrs"
import { BaseModel } from "~/server/base/Model"
import { CacheKey } from "~/server/cache"
import { getGearImage } from "~/server/canvas/gearImage"
import { getOsrsPrices } from "~/server/cron/tasks/getOsrsPrices"
import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { StaticDataModel } from "~/server/db/model/StaticData"
import { StaticDataType } from "~/types/entity"
import { ItemSlot, ItemWeaponVariant, OsrsItemData } from "~/types/osrs"

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

  async addItem({
    userId,
    itemBoughtPrice,
    itemData,
  }: {
    userId: string
    itemBoughtPrice: number
    itemData: OsrsItemData
  }) {
    const items = await this.getItems(userId)
    const slotError = this.getSlotError({
      itemData,
      items,
    })

    if (slotError) {
      throw new OsrsItemSlotError(slotError)
    }

    await this.em.create(this.Entity, {
      userId,
      itemId: itemData.id,
      itemName: itemData.name,
      itemSlot: itemData.slot,
      itemBoughtPrice: BigInt(itemBoughtPrice),
    } satisfies RequiredEntityData<OsrsItemsEntity>)
    await this.em.flush()

    // Clear user cache
    const cachedImageByUserId = this.context.cache.get(CacheKey.UserGearImage)
    cachedImageByUserId.uns(userId)
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
    itemData,
    items,
  }: {
    itemData: OsrsItemData
    items: OsrsItemsEntity[]
  }): string | undefined {
    const itemBySlot = new Map(items.map((item) => [item.itemSlot, item]))

    if (itemBySlot.has(itemData.slot)) {
      return "Sell your current item to replace"
    }

    if (
      itemData.weaponVariant === ItemWeaponVariant.TwoHanded &&
      itemBySlot.has(ItemSlot.Shield)
    ) {
      return "Can't buy a two-handed weapon while using a shield"
    }

    if (itemData.slot === ItemSlot.Shield && itemBySlot.has(ItemSlot.Weapon)) {
      const weapon = itemBySlot.get(ItemSlot.Weapon)!
      const weaponData = osrsItemByLcName.get(weapon.itemName.toLowerCase())

      if (weaponData?.weaponVariant === ItemWeaponVariant.TwoHanded) {
        return "Can't buy a shield while using a two-handed weapon"
      }
    }

    return undefined
  }
}
