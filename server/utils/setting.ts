import { Settings, SettingKey } from "../constants/setting"
import { SettingModel } from "../models/Setting"
import { BaseContext } from "../types"

export const requireSetting = async <K extends SettingKey>(
  context: BaseContext,
  key: K,
  requireValue: Settings[K],
): Promise<boolean> => {
  const model = new SettingModel(context)
  const setting = await model.get(key)

  return requireValue === setting
}
