import { SlashCommandBuilder } from "discord.js"
import { BaseCommand } from "../base/Command"
import { getAiClient, handleCreateAiBatch } from "../utils/ai"
import ToxicScoreBatchBatchModel from "../models/ToxicScoreBatch"

export default class TestCommand extends BaseCommand {
  static version = 1

  static command = new SlashCommandBuilder()
    .setName("test")
    .setDescription("test")

  async execute() {
    const model = new ToxicScoreBatchBatchModel()

    // Create remote batches
    const batches = await model.getNextBatches()
    if (batches.length) {
      const remoteBatch = await handleCreateAiBatch(
        batches.map((el) => el.body),
      )
      await model.setRemoteBatchId(
        batches.map((el) => el.id),
        remoteBatch.id,
      )
    }

    // Get the status of remote batches
    const remoteBatchIds = await model.getRemoteBatchIds()
    if (remoteBatchIds.length) {
      const ai = getAiClient()!
      const remoteBatches = await Promise.all(
        remoteBatchIds.map((batchId) => ai.batches.retrieve(batchId)),
      )

      console.log(JSON.stringify(remoteBatches, null, 2))
    }

    this.reply({
      ephemeral: true,
      content: "Done",
    })
  }
}
