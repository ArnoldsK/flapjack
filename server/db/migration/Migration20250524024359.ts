import { Migration } from "@mikro-orm/migrations"

import { appConfig } from "~/server/config"

// Seriously, why am I not using Postgres?
export class Migration20250524024359 extends Migration {
  override async up(): Promise<void> {
    const [persistentThreadEntityStatistics] = await this.execute(/* sql */ `
      SELECT COUNT(*) as hasIndex
      FROM information_schema.statistics
      WHERE table_schema = '${appConfig.db.database}'
        AND table_name = 'persistent_thread_entity'
        AND index_name = 'persistent_thread_entity_thread_id_unique';
    `)

    if (!persistentThreadEntityStatistics.hasIndex) {
      this.addSql(/* sql */ `
        ALTER TABLE persistent_thread_entity ADD UNIQUE INDEX persistent_thread_entity_thread_id_unique (thread_id);
      `)
    }

    const [rolesEntityStatistics] = await this.execute(/* sql */ `
      SELECT COUNT(*) as hasIndex
      FROM information_schema.statistics
      WHERE table_schema = '${appConfig.db.database}'
        AND table_name = 'roles_entity'
        AND index_name = 'roles_entity_user_id_unique';
    `)

    if (!rolesEntityStatistics.hasIndex) {
      this.addSql(/* sql */ `
        ALTER TABLE roles_entity ADD UNIQUE INDEX roles_entity_user_id_unique (user_id);
      `)
    }
  }
}
