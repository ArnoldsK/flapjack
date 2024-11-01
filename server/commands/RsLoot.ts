import { ChannelType, SlashCommandBuilder, codeBlock } from "discord.js"
import { BaseCommand } from "../base/Command"
import { appConfig } from "../config"
import { joinAsLines } from "../utils/string"
import { isTextChannel } from "../utils/channel"

export class RsLootCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("rs-loot")
    .setDescription("Get the RS channel webhook URL for use with plugins")

  async execute() {
    if (
      this.channel.id !== appConfig.discord.ids.channels.runescape ||
      !isTextChannel(this.channel)
    ) {
      this.fail("Not allowed in this channel")
      return
    }

    // TODO add cleanup to remove unused webhooks (e.g. username change)
    const webhooks = await this.channel.fetchWebhooks()
    const avatar = this.member.displayAvatarURL({
      forceStatic: true,
      extension: "png",
      size: 64,
    })

    let userWebhook = webhooks.find((el) => el.name === this.user.username)
    if (!userWebhook) {
      userWebhook = await this.channel.createWebhook({
        name: this.user.username,
        avatar,
      })
    } else {
      await userWebhook.edit({ avatar })
    }

    this.reply({
      content: joinAsLines("Your webhook URL is:", codeBlock(userWebhook.url)),
      ephemeral: true,
    })
  }
}
