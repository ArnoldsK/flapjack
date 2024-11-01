import { In, Repository } from "typeorm"
import { db } from "../database"
import SettingEntity from "../entity/Setting"
import { BaseContext } from "../types"
import { CacheKey } from "../types/cache"
import { SettingKey, DEFAULT_SETTINGS, Settings } from "../constants/setting"
import { dedupe } from "../utils/array"

export class SettingModel {
  #context: BaseContext
  #repository: Repository<SettingEntity>

  constructor(context: BaseContext) {
    this.#repository = db.getRepository(SettingEntity)
    this.#context = context
  }

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
    const cached = this.#context.cache.get(CacheKey.Setting)
    if (this.#validateCache(cached)) {
      return cached
    }

    // Get saved
    const entities = await this.#repository.find()
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

    if (oldKeys.length) {
      await this.#repository.delete({
        key: In(oldKeys),
      })
    }

    // Update cache
    this.#context.cache.set(CacheKey.Setting, settings)

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
    await this.#repository.upsert(
      [
        {
          key,
          value: JSON.stringify(value),
        },
      ],
      ["key"],
    )

    // Update cache if present
    const cached = this.#context.cache.get(CacheKey.Setting)
    if (cached) {
      this.#context.cache.set(CacheKey.Setting, {
        ...cached,
        [key]: value,
      })
    }
  }
}
