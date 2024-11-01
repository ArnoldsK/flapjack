import { z } from "zod"

export const settingsSchema = z.object({
  "tasks.hourlyGifBanners.enabled": z.boolean(),
})

export type Settings = z.TypeOf<typeof settingsSchema>

export type SettingKey = keyof Settings

export const DEFAULT_SETTINGS: Settings = {
  "tasks.hourlyGifBanners.enabled": false,
}
