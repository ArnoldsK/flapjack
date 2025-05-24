import { MikroORM } from "@mikro-orm/core"
import { Client, Guild } from "discord.js"

import CacheManager from "~/server/cache"

export interface BaseContext {
  client: Client
  guild: () => Guild
  cache: CacheManager
  db: MikroORM
}
