import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
} from "discord.js"
import { BaseCommand } from "../base/Command"
import { formatCredits } from "../utils/credits"
import assert from "assert"
import CreditsModel from "../models/Credits"
import { randomValue } from "../utils/random"

export default class TestCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test")

  async execute() {
    // nothing
  }
}
