import {
  Channel,
  ChannelType,
  GuildTextBasedChannel,
  TextChannel,
} from "discord.js"
import { DISCORD_IDS } from "~/constants"

export const isCasinoChannel = (channel: GuildTextBasedChannel): boolean => {
  return channel.id === DISCORD_IDS.channels.casino
}

export const isTextChannel = (
  channel: Channel | null | undefined,
): channel is TextChannel => {
  return !!channel && channel.type === ChannelType.GuildText
}
