import { GuildTextBasedChannel } from "discord.js"
import { appConfig } from "../config"

export const isCasinoChannel = (channel: GuildTextBasedChannel): boolean => {
  return channel.id === appConfig.discord.ids.channels.casino
}
