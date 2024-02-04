import "reflect-metadata"
import next from "next"
import express from "express"
import http from "http"

import { getUrl } from "./utils/web"
import { appConfig } from "./config"
import { Client, Events, GatewayIntentBits } from "discord.js"
import { getSetupCommands, handleApiCommands } from "./utils/commands"
import { assert } from "./utils/error"

// Prepare next app
const nextApp = next({ dev: appConfig.dev })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  assert(!!appConfig.discord.token, "Discord token missing")
  assert(!!appConfig.discord.client, "Discord client missing")

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

  client.on(Events.ClientReady, () => {
    console.log(`> Discord client ready as ${client.user?.tag}`)
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
  // Web server
  // #############################################################################
  const server = express()
  const httpServer = http.createServer(server)

  server.all("*", (req, res) => handle(req, res))

  httpServer.listen(appConfig.web.port, () => {
    console.log(`> Web server ready on ${getUrl()}`)
  })
})
