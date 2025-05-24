import { Entity, PrimaryKey, Property } from "@mikro-orm/core"

import type { SettingKey } from "~/server/db/model/Setting"

@Entity()
export class SettingEntity {
  @PrimaryKey()
  key: SettingKey

  @Property({ type: "text" })
  value: string
}
