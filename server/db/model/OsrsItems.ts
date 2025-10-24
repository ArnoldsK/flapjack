import { RequiredEntityData } from "@mikro-orm/core"
import { APIEmbedThumbnail, AttachmentBuilder, GuildMember } from "discord.js"

import { BaseModel } from "~/server/base/Model"
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

export class OsrsItemsModel extends BaseModel {
  protected override Entity = OsrsItemsEntity

  async getUserItems(userId: string): Promise<OsrsItemsEntity[]> {
    return await this.em.find(this.Entity, { userId })
  }

  async addItem(input: RequiredEntityData<OsrsItemsEntity>) {
    const items = await this.getUserItems(input.userId)
    const slotError = this.getSlotError({
      slot: input.itemSlot,
      items,
    })

    if (slotError) {
      throw new OsrsItemSlotError(slotError)
    }

    await this.em.create(this.Entity, input)
    await this.em.flush()
  }

  async removeItem({ userId, itemId }: { userId: string; itemId: number }) {
    await this.em.nativeDelete(this.Entity, {
      userId,
      itemId,
    })
  }

  async getPriceByItemIdMap(): Promise<Map<number, number>> {
    const model = new StaticDataModel(this.context)
    const data = await model.get(StaticDataType.OsrsPrices)

    if (!data) {
      return await getOsrsPrices(this.context)
    }

    return new Map(data.items)
  }

  async getEmbedData(
    member: GuildMember,
  ): Promise<OsrsItemsEmbedData & { items: OsrsItemsEntity[] }> {
    const items = await this.getUserItems(member.id)
    const image = await getGearImage({
      avatarUrl: member.displayAvatarURL({
        extension: "png",
        size: 64,
      }),
      items,
    })

    return {
      items,
      thumbnail: {
        url: "attachment://gear.png",
      },
      files: [new AttachmentBuilder(image, { name: "gear.png" })],
    }
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
