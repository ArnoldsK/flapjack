import { Entity, BaseEntity, Column, PrimaryGeneratedColumn } from "typeorm"
import type { WeekRecapData } from "../../../types/recap"

@Entity()
export class RecapEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number

  @Column({
    type: "text",
    transformer: {
      from: (value?: string) => {
        if (!value) {
          throw new Error("Recap value is empty")
        }

        return JSON.parse(value) as WeekRecapData
      },
      to: (value: WeekRecapData) => {
        return JSON.stringify(value)
      },
    },
  })
  value: WeekRecapData
}
