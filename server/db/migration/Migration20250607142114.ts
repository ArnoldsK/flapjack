import { Migration } from "@mikro-orm/migrations"

export class Migration20250607142114 extends Migration {
  override async up(): Promise<void> {
    this.execute(/*sql*/ `
      ALTER TABLE credits_entity ADD multiplier tinyint(1) NOT NULL DEFAULT '1';
    `)
  }

  override async down(): Promise<void> {}
}
