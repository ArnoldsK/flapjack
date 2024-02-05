import "reflect-metadata"
import next from "next"
import express from "express"
import http from "http"

import { getUrl } from "./utils/web"
import { appConfig } from "./config"
import { Client, Events, GatewayIntentBits } from "discord.js"
import { getSetupCommands, handleApiCommands } from "./utils/command"
import { assert } from "./utils/error"
import { db } from "./database"
import { getGroupedEvents } from "./utils/event"

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
  // Commands
  // #############################################################################
  const commands = getSetupCommands()

  await handleApiCommands(commands)

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

  client.login(appConfig.discord.token)

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
      await Promise.all(
        event.callbacks.map((callback) => {
          return callback.apply(null, args)
        }),
      )
    })
  }

  // #############################################################################
  // Web server
  // #############################################################################
  const server = express()
  const httpServer = http.createServer(server)

  server.all("*", (req, res) => handle(req, res))

  httpServer.listen(appConfig.web.port, () => {
    console.log(`> Web server ready on ${getUrl()}`)
  })
})

// #############################################################################
// On Ctrl+C remove local commands
// #############################################################################
process.on("SIGINT", async () => {
  if (!appConfig.dev) return

  console.log("> Remove commands")
  await handleApiCommands([], true)

  process.exit(2)
})
