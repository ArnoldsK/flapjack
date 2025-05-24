import { EntityManager } from "@mikro-orm/core"

import { BaseContext } from "~/types"

export abstract class BaseModel {
  context: BaseContext
  em: EntityManager

  constructor(context: BaseContext) {
    this.context = context
    this.em = context.db.em.fork()
  }
}
