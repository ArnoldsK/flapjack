import { z } from "zod"

import { BaseModel } from "~/server/base/Model"
import { CacheKey } from "~/server/cache"
import { SettingEntity } from "~/server/db/entity/Setting"
import { dedupe } from "~/server/utils/array"

export const settingsSchema = z.object({
  "tasks.hourlyGifBanners.enabled": z.boolean(),
})

export type Settings = z.TypeOf<typeof settingsSchema>

export type SettingKey = keyof Settings

export const DEFAULT_SETTINGS: Settings = {
  "tasks.hourlyGifBanners.enabled": false,
}

export class SettingModel extends BaseModel {
  // #############################################################################
  // Cache
  // #############################################################################
  #validateCache(cached: Settings | null): cached is Settings {
    if (!cached) {
      return false
    }

    const defaultKeys = Object.keys(DEFAULT_SETTINGS)
    const uniqueKeys = dedupe([...defaultKeys, ...Object.keys(cached)])

    return defaultKeys.length === uniqueKeys.length
  }

  // #############################################################################
  // Getter
  // #############################################################################
  async getAll(): Promise<Settings> {
    // Return cached early
    const cached = this.context.cache.get(CacheKey.Setting)
    if (this.#validateCache(cached)) {
      return cached
    }

    // Get saved
    const entities = await this.em.findAll(SettingEntity)
    const settings = { ...DEFAULT_SETTINGS }

    for (const [key, defaultValue] of Object.entries(settings)) {
      const entity = entities.find((el) => el.key === key)

      settings[key as SettingKey] = entity
        ? JSON.parse(entity.value)
        : defaultValue
    }

    // Remove old settings
    const defaultKeys = Object.keys(DEFAULT_SETTINGS)
    const oldKeys = entities
      .map((el) => el.key)
      .filter((key) => !defaultKeys.includes(key))

    if (oldKeys.length > 0) {
      await this.em.nativeDelete(SettingEntity, {
        key: {
          $in: oldKeys,
        },
      })
    }

    // Update cache
    this.context.cache.set(CacheKey.Setting, settings)

    return settings
  }

  async get<K extends SettingKey>(key: K): Promise<Settings[K]> {
    // Fetch all first to use cache
    const settings = await this.getAll()

    return settings[key]
  }

  // #############################################################################
  // Setter
  // #############################################################################
  async set<K extends SettingKey>(key: K, value: (typeof DEFAULT_SETTINGS)[K]) {
    await this.em.upsert({
      key,
      value: JSON.stringify(value),
    })

    // Update cache if present
    const cached = this.context.cache.get(CacheKey.Setting)
    if (cached) {
      this.context.cache.set(CacheKey.Setting, {
        ...cached,
        [key]: value,
      })
    }
  }
}
