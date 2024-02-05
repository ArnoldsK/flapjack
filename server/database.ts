import { join } from "path"
import { DataSource } from "typeorm"

export const db = new DataSource({
  type: "mysql",
  host: "localhost",
  port: 3306,
  username: "root",
  password: "root",
  database: "flapjack",
  logging: false,
  entities: [join(__dirname, "entity", "*.{ts,js}")],
  subscribers: [],
  migrations: [join(__dirname, "migration", "*.{ts,js}")],
  // Auto-update tables
  synchronize: true,
  // Run migrations for table removals
  migrationsRun: true,
})
