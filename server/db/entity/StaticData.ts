import { Entity, JsonType, PrimaryKey, Property } from "@mikro-orm/core"

import { StaticData, StaticDataType } from "~/types/entity"

@Entity()
export class StaticDataEntity<Type extends StaticDataType> {
  @PrimaryKey()
  type: StaticDataType

  @Property({
    type: JsonType,
    columnType: "longtext",
  })
  value: StaticData[Type]
}
