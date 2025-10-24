import { SlashCommandBuilder, codeBlock } from "discord.js"

import { DISCORD_IDS } from "~/constants"
import { BaseCommand } from "~/server/base/Command"
import { isTextChannel } from "~/server/utils/channel"
import { assert } from "~/server/utils/error"
import { joinAsLines } from "~/server/utils/string"

export default class RsLootCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("rs-loot")
    .setDescription("Get the RS channel webhook URL for use with plugins")

  get isEphemeral(): boolean {
    return true
  }

  async execute() {
    assert(isTextChannel(this.channel), "Not a valid channel")
    assert(
      this.channel.id === DISCORD_IDS.channels.runescape,
      "Not allowed in this channel",
    )

    // TODO add cleanup to remove unused webhooks (e.g. username change)
    const webhooks = await this.channel.fetchWebhooks()
    const avatar = this.member.displayAvatarURL({
      forceStatic: true,
      extension: "png",
      size: 64,
    })

    let userWebhook = webhooks.find((el) => el.name === this.user.username)
    if (userWebhook) {
      await userWebhook.edit({ avatar })
    } else {
      userWebhook = await this.channel.createWebhook({
        name: this.user.username,
        avatar,
      })
    }

    this.reply({
      content: joinAsLines("Your webhook URL is:", codeBlock(userWebhook.url)),
    })
  }
}
