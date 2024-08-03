import {
  ChannelType,
  GuildBasedChannel,
  GuildTextBasedChannel,
  TextChannel,
} from "discord.js"
import { discordIds } from "../config"

export const isCasinoChannel = (channel: GuildTextBasedChannel): boolean => {
  return channel.id === discordIds.channels.casino
}

export const isTextChannel = (
  channel: GuildBasedChannel | null | undefined,
): channel is TextChannel => {
  return !!channel && channel.type === ChannelType.GuildText
}
