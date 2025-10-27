import { Migration } from "@mikro-orm/migrations"

export class Migration20251027073633 extends Migration {
  override async up(): Promise<void> {
    await this.execute(/* sql */ `
      ALTER TABLE credits_entity ADD last_message_at timestamp;
    `)
  }

  override async down(): Promise<void> {}
}
