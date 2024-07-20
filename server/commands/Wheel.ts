import { AttachmentBuilder, SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { getWheelImage } from "../canvas/wheel"

enum OptionName {
  Choices = "choices",
}

export default class WheelCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("wheel")
    .setDescription("Spin the wheel!")
    .addStringOption((option) =>
      option
        .setName(OptionName.Choices)
        .setDescription('Choices for the wheel, separated by ";".')
        .setRequired(true),
    )

  async execute() {
    const input = this.interaction.options.getString(OptionName.Choices, true)
    const choices = input.split(";").map((el) => el.trim())

    if (choices.length < 2) {
      this.fail('At least two choices are required. Separate them with ";".')
      return
    }

    // Image generation might take a while, request wait time...
    await this.interaction.deferReply()

    const image = await getWheelImage(choices)

    this.editReply({
      files: [
        {
          name: "wheel.gif",
          attachment: image,
        },
      ],
    })
  }
}
