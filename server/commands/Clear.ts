import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { PermissionFlags, permission } from "../utils/permission"

export default class Clear extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("clear")
    .setDescription("Push all visible messages out of view")

  static permissions = permission({
    type: "allow",
    permissions: [PermissionFlags.ManageMessages],
  })

  async execute() {
    const nonBreakingSpace = " "
    const preText = "Clearing visible messages."
    const postText = `This is the start of the #${this.channel.name} channel.`
    const spacer = `\n${nonBreakingSpace}`.repeat(100)

    this.channel.send(`${preText}${spacer}${postText}`)
  }
}
