import { AnyEntity, EntityManager } from "@mikro-orm/core"

import { BaseContext } from "~/types"

export abstract class BaseModel {
  protected Entity: AnyEntity
  protected em: EntityManager

  constructor(protected context: BaseContext) {
    this.em = context.em()
  }
}
