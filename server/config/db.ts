import { Migrator } from "@mikro-orm/migrations"
import { defineConfig } from "@mikro-orm/mysql"

import { appConfig } from "~/server/config"

export default defineConfig({
  entities: ["./dist/server/db/entity/*.js"],
  entitiesTs: ["./server/db/entity/*.ts"],

  extensions: [Migrator],
  migrations: {
    tableName: "migrations",
    path: "./dist/server/db/migration",
    pathTs: "./server/db/migration",
    // This can only cause issues for MySQL
    transactional: false,
  },

  host: appConfig.db.host,
  port: appConfig.db.port,
  name: appConfig.db.username,
  password: appConfig.db.password,
  dbName: appConfig.db.database,

  debug: appConfig.dev,
})
