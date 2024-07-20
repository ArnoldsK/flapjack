import "reflect-metadata"
import next from "next"
import express from "express"
import http from "http"

import { getUrl } from "./utils/web"
import { appConfig } from "./config"
import { Client, Events, GatewayIntentBits } from "discord.js"
import {
  getSetupCommands,
  handleApiCommands,
  removeApiCommands,
} from "./utils/command"
import { assert } from "./utils/error"
import { db } from "./database"
import { getGroupedEvents } from "./utils/event"
import { handleCron } from "./utils/cron"
import { BaseContext } from "./types"
import CacheManager from "./cache"

// Prepare next app
const nextApp = next({ dev: appConfig.dev })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  assert(!!appConfig.discord.token, "Discord token missing")
  assert(!!appConfig.discord.client, "Discord client missing")

  // #############################################################################
  // Database
  // #############################################################################
  await db.initialize()

  // #############################################################################
  // Client
  // #############################################################################
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
    allowedMentions: {
      parse: ["users"],
    },
  })

  // #############################################################################
  // Context
  // #############################################################################
  const context: BaseContext = {
    client,
    cache: new CacheManager(),
  }

  // #############################################################################
  // Commands
  // #############################################################################
  const commands = getSetupCommands(context)

  await handleApiCommands(commands)

  // #############################################################################
  // Client events
  // #############################################################################
  client.once(Events.ClientReady, async () => {
    console.log(`> Discord client ready as ${client.user?.tag}`)

    // Pre-fetch data for cache
    const guild = client.guilds.cache.get(appConfig.discord.ids.guild)!
    await guild.members.fetch()
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      const command = commands.find((el) => el.name === interaction.commandName)

      try {
        await command?.execute(interaction)
      } catch (err) {
        // console.error("> Command error >", interaction.commandName, err)
        interaction.reply({
          content: (err as Error).message,
          ephemeral: true,
        })
      }
    }
  })

  // #############################################################################
  // Custom events
  // #############################################################################
  const groupedEvents = getGroupedEvents()

  for (const event of groupedEvents) {
    client.on(event.name, async (...args) => {
      try {
        await Promise.all(
          event.callbacks.map((callback) => {
            return callback.apply(null, args)
          }),
        )
      } catch (err) {
        console.error(err)
      }
    })
  }

  // #############################################################################
  // Client login
  // ! Must be below any events
  // #############################################################################
  await client.login(appConfig.discord.token)

  // #############################################################################
  // Cron
  // #############################################################################
  handleCron(client)

  // #############################################################################
  // Web server
  // #############################################################################
  const server = express()
  const httpServer = http.createServer(server)

  server.all("*", (req, res) => handle(req, res))

  httpServer.listen(appConfig.web.port, () => {
    console.log(`> Web server ready on ${getUrl()}`)
  })

  // #############################################################################
  // On Ctrl+C remove local commands
  // #############################################################################
  process.on("SIGINT", async () => {
    if (!appConfig.dev) return

    await removeApiCommands()

    process.exit(2)
  })
})
