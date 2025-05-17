import { createRoute } from "../utils/routes"
import { CommandExecuteModel } from "../db/model/CommandExecute"
import { ApiStats } from "../../types/api"
import { StatsModel } from "../db/model/Stats"

export default createRoute({
  path: "/api/stats",
  handler: async (context, _req, res) => {
    const stats: ApiStats = {
      messagesPerDay: [],
      commands: [],
    }

    // Messages
    const statsModel = new StatsModel(context)
    stats.messagesPerDay = await statsModel.getApiItems()

    // Commands
    const commandsModel = new CommandExecuteModel(context)
    stats.commands = await commandsModel.getApiItems()

    res.json(stats)
  },
})
