import { Client } from "discord.js"
import CacheManager from "../cache"

export interface BaseContext {
  client: Client
  cache: CacheManager
}
