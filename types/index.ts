import { EntityManager } from "@mikro-orm/core"
import { Client, Guild } from "discord.js"

import CacheManager from "~/server/cache"

export interface BaseContext {
  client: Client
  guild: () => Guild
  cache: CacheManager
  /**
   * Gets a fork of the DB EntityManager
   */
  em: () => EntityManager
}

export type Nullish<T> = T | null | undefined
