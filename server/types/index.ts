import { Client, Guild } from "discord.js"
import CacheManager from "../cache"

export interface BaseContext {
  client: Client
  guild: () => Guild
  cache: CacheManager
}
