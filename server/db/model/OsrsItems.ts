import { RequiredEntityData } from "@mikro-orm/core"
import { APIEmbedThumbnail, AttachmentBuilder, GuildMember } from "discord.js"

import { BaseModel } from "~/server/base/Model"
import { getOsrsGearImage } from "~/server/canvas/osrsGearImage"
import { getOsrsPrices } from "~/server/cron/tasks/getOsrsPrices"
import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { StaticDataModel } from "~/server/db/model/StaticData"
import { StaticDataType } from "~/types/entity"

export interface OsrsItemsEmbedData {
  thumbnail: APIEmbedThumbnail
  files: AttachmentBuilder[]
}

export class OsrsItemsModel extends BaseModel {
  protected override Entity = OsrsItemsEntity

  async getUserItems(userId: string): Promise<OsrsItemsEntity[]> {
    return await this.em.find(this.Entity, { userId })
  }

  async addItem(input: RequiredEntityData<OsrsItemsEntity>) {
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
    const image = await getOsrsGearImage({
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
}
