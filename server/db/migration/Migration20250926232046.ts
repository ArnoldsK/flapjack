import { Migration } from "@mikro-orm/migrations"

export class Migration20250926232046 extends Migration {
  override async up(): Promise<void> {
    this.execute(/*sql*/ `
      ALTER TABLE ai_searches_entity ADD input TEXT NOT NULL;
    `)
  }

  override async down(): Promise<void> {}
}
