import "reflect-metadata"
import http from "node:http"

import { RequestContext } from "@mikro-orm/core"
import { Client, Events, GatewayIntentBits } from "discord.js"
import express from "express"
import next from "next"

import { DISCORD_IDS } from "~/constants"
import CacheManager from "~/server/cache"
import { appConfig } from "~/server/config"
import { createConnection } from "~/server/db"
import {
  getSetupCommands,
  handleApiCommands,
  removeApiCommands,
} from "~/server/utils/command"
import { handleCron } from "~/server/utils/cron"
import { assert } from "~/server/utils/error"
import { getGroupedEvents } from "~/server/utils/event"
import { handleCustomRoutes } from "~/server/utils/routes"
import { getUrl } from "~/server/utils/web"
import { BaseContext } from "~/types"

// Prepare next app
const nextApp = next({ dev: appConfig.dev })
const handle = nextApp.getRequestHandler()

// eslint-disable-next-line unicorn/prefer-top-level-await
nextApp.prepare().then(async () => {
  assert(!!appConfig.discord.token, "Discord token missing")
  assert(!!appConfig.discord.client, "Discord client missing")

  // #############################################################################
  // Database
  // #############################################################################
  const db = await createConnection()

  // Run migrations
  await db.migrator.up()

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
    guild: () => client.guilds.cache.get(DISCORD_IDS.guild)!,
    cache: new CacheManager(),
    em: () => db.em.fork(),
  }

  // #############################################################################
  // Commands
  // #############################################################################
  const commands = await getSetupCommands(context)

  await handleApiCommands(commands)

  // #############################################################################
  // Client events
  // #############################################################################
  client.once(Events.ClientReady, async () => {
    if (appConfig.webOnly) return

    console.log(`> Discord client ready as ${client.user?.tag}`)

    // Pre-fetch members
    const guild = client.guilds.cache.get(DISCORD_IDS.guild)!
    await guild.members.fetch()
  })

  client.on(Events.InteractionCreate, async (interaction) => {
    if (appConfig.webOnly) return

    if (interaction.isChatInputCommand()) {
      const command = commands.find((el) => el.name === interaction.commandName)

      try {
        await command?.execute(interaction)
      } catch (error) {
        interaction[interaction.deferred ? "editReply" : "reply"]({
          content: (error as Error).message,
          ephemeral: true,
        })
      }
    }
  })

  // #############################################################################
  // Custom events
  // #############################################################################
  const groupedEvents = await getGroupedEvents()

  for (const event of groupedEvents) {
    if (appConfig.webOnly) break

    client.on(event.name, async (...args) => {
      try {
        await Promise.all(
          event.callbacks.map((callback) => {
            return Reflect.apply(callback, null, [context, ...args])
          }),
        )
      } catch (error) {
        console.error(error)
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
  handleCron(context)

  // #############################################################################
  // Web server
  // #############################################################################
  const server = express()
  const httpServer = http.createServer(server)

  server.use(express.json())
  server.use(express.urlencoded({ extended: true }))
  server.use(express.static("public"))

  server.use((_req, _res, next) => {
    RequestContext.create(db.em, next)
  })

  await handleCustomRoutes(context, server)

  server.all("*", (req, res) => handle(req, res))

  httpServer.listen(appConfig.web.port, () => {
    console.log(`> Web server ready on ${getUrl()}`)
  })

  // #############################################################################
  // Graceful exit
  // #############################################################################
  process.on("SIGINT", async () => {
    await db.close()

    if (appConfig.dev) {
      await removeApiCommands()
    }

    process.exit(2)
  })
})
