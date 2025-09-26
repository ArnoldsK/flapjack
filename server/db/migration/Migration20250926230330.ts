import { Migration } from "@mikro-orm/migrations"

export class Migration20250926230330 extends Migration {
  override async up(): Promise<void> {
    this.execute(/*sql*/ `
      CREATE TABLE ai_searches_entity (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        query text NOT NULL,
        created_at datetime NOT NULL DEFAULT current_timestamp()
      );
    `)
  }

  override async down(): Promise<void> {}
}
