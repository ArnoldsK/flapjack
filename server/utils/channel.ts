import { GuildTextBasedChannel } from "discord.js"
import { discordIds } from "../config"

export const isCasinoChannel = (channel: GuildTextBasedChannel): boolean => {
  return channel.id === discordIds.channels.casino
}
