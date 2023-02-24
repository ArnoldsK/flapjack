import next from "next"
import express from "express"
import http from "http"

import { getUrl } from "./helpers/web"
import { appConfig } from "./config"
import { Client, Events, GatewayIntentBits, REST, Routes } from "discord.js"
import { getSetupCommands } from "./helpers/commands"
import { assert } from "./helpers/error"

// Prepare next app
const nextApp = next({ dev: appConfig.dev })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(async () => {
  // Validate data
  assert(!!appConfig.discord.token, "Discord token missing")

  // Get discord commands
  const commands = getSetupCommands()

  // Update discord commands
  const rest = new REST({ version: "10" }).setToken(appConfig.discord.token)

  await rest.put(
    Routes.applicationGuildCommands(
      appConfig.discord.ids.client,
      appConfig.discord.ids.guild,
    ),
    {
      body: commands.map(({ execute, ...command }) => command),
    },
  )

  // Initiate discord client
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.GuildMembers,
    ],
  })

  client.login(appConfig.discord.token)

  // Handle discord events
  client.on(Events.ClientReady, () => {
    console.log(`> Discord client ready as ${client.user?.tag}`)
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    // Handle commands
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

  // Web server
  const server = express()
  const httpServer = http.createServer(server)

  // Fallback to next handler
  server.all("*", (req, res) => handle(req, res))

  // Listen
  httpServer.listen(appConfig.web.port, () => {
    console.log(`> Web server ready on ${getUrl()}`)
  })
})
