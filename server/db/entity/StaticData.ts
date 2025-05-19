import { Entity, BaseEntity, Column, PrimaryColumn } from "typeorm"

import { StaticData, StaticDataType } from "~/types/entity"

@Entity()
export class StaticDataEntity<Type extends StaticDataType> extends BaseEntity {
  @PrimaryColumn()
  type: StaticDataType

  @Column({
    type: "longtext",
    transformer: {
      from: (value?: string) => {
        if (!value) {
          throw new Error("Data value is empty")
        }

        return JSON.parse(value)
      },
      to: (value) => {
        return JSON.stringify(value)
      },
    },
  })
  value: StaticData[Type]
}
