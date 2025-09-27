import { Migration } from "@mikro-orm/migrations"

export class Migration20250927200943 extends Migration {
  override async up(): Promise<void> {
    this.execute(/*sql*/ `
      CREATE TABLE user_message_entity (
        message_id VARCHAR(255) NOT NULL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        channel_id VARCHAR(255) NOT NULL,
        created_at TIMESTAMP NOT NULL
      );
    `)
  }

  override async down(): Promise<void> {}
}
