import { CacheKey } from "../cache"
import { createRoute } from "../utils/routes"
import { CommandExecuteModel } from "../db/model/CommandExecute"
import { ApiStats } from "../types/api"

export default createRoute({
  path: "/api/stats",
  handler: async (context, _req, res) => {
    const stats: ApiStats = {
      commands: [],
    }

    // Commands
    let commands = context.cache.get(CacheKey.StatsCommands)
    if (!commands) {
      const commandsModel = new CommandExecuteModel()

      commands = await commandsModel.getApiCommands()
      context.cache.set(CacheKey.StatsCommands, commands)
    }
    stats.commands = commands

    res.json(stats)
  },
})
