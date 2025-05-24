import { Migration } from "@mikro-orm/migrations"

// Seriously, why am I not using Postgres?
export class Migration20250524024359 extends Migration {
  override async up(): Promise<void> {
    this.addSql(/* sql */ `
      -- Check if the unique index exists on persistent_thread_entity
      SELECT COUNT(*)
      FROM information_schema.statistics
      WHERE table_schema = 'your_database_name'
        AND table_name = 'persistent_thread_entity'
        AND index_name = 'persistent_thread_entity_thread_id_unique';

      -- If the above returns 1, then run:
      ALTER TABLE persistent_thread_entity DROP INDEX persistent_thread_entity_thread_id_unique;

      -- Add (or re-add) the unique index
      ALTER TABLE persistent_thread_entity ADD UNIQUE INDEX persistent_thread_entity_thread_id_unique (thread_id);
    `)

    this.addSql(/* sql */ `
      -- Check if the unique index exists on roles_entity
      SELECT COUNT(*)
      FROM information_schema.statistics
      WHERE table_schema = 'your_database_name'
        AND table_name = 'roles_entity'
        AND index_name = 'roles_entity_user_id_unique';

      -- If it exists, drop it
      ALTER TABLE roles_entity DROP INDEX roles_entity_user_id_unique;

      -- Add (or re-add) the unique index
      ALTER TABLE roles_entity ADD UNIQUE INDEX roles_entity_user_id_unique (user_id);
    `)
  }
}
