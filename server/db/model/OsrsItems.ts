import { BaseModel } from "~/server/base/Model"
import { getOsrsPrices } from "~/server/cron/tasks/getOsrsPrices"
import { OsrsItemsEntity } from "~/server/db/entity/OsrsItems"
import { StaticDataModel } from "~/server/db/model/StaticData"
import { StaticDataType } from "~/types/entity"
import { OsrsPriceItem } from "~/types/osrs"

export class OsrsItemsModel extends BaseModel {
  protected override Entity = OsrsItemsEntity

  async getUserItems(userId: string): Promise<OsrsItemsEntity[]> {
    return await this.em.find(this.Entity, { userId })
  }

  async getPrices(): Promise<OsrsPriceItem[]> {
    const model = new StaticDataModel(this.context)
    const data = await model.get(StaticDataType.OsrsPrices)

    if (!data) {
      return (await getOsrsPrices(this.context)).items
    }

    return data.items
  }
}
