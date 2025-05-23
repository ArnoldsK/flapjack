import { defineConfig } from "@mikro-orm/mysql"

import { appConfig } from "~/server/config"

export default defineConfig({
  entities: ["./dist/server/db/entity/*.js"],
  entitiesTs: ["./server/db/entity/*.ts"],

  host: appConfig.db.host,
  port: appConfig.db.port,
  name: appConfig.db.username,
  password: appConfig.db.password,
  dbName: appConfig.db.database,

  debug: appConfig.dev,
})
