import { BaseModel } from "~/server/base/Model"
import { StaticDataEntity } from "~/server/db/entity/StaticData"
import { StaticData, StaticDataType } from "~/types/entity"

export class StaticDataModel extends BaseModel {
  async get<Type extends StaticDataType>(
    dataType: Type,
  ): Promise<StaticData[Type] | null> {
    const entity = await this.em.findOne(StaticDataEntity, {
      type: dataType,
    })

    return entity?.value ?? null
  }

  async set<Type extends StaticDataType>(
    dataType: Type,
    value: StaticData[Type],
  ) {
    await this.em.upsert(StaticDataEntity, {
      type: dataType,
      value,
    })
  }
}
