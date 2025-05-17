import { Entity, Column, BaseEntity, PrimaryColumn } from "typeorm"
import type { SettingKey } from "../model/Setting"

@Entity()
export class SettingEntity extends BaseEntity {
  @PrimaryColumn({ unique: true, type: "varchar" })
  key: SettingKey

  @Column({ type: "text" })
  value: string
}
