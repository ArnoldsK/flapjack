import { Migration } from "@mikro-orm/migrations"

export class Migration20251023155528 extends Migration {
  override async up(): Promise<void> {
    await this.execute(/* sql */ `
      CREATE TABLE osrs_items_entity (
        id int NOT NULL AUTO_INCREMENT,
        user_id varchar(255) NOT NULL,
        item_id int NOT NULL,
        item_slot varchar(255) NOT NULL,
        item_name varchar(255) NOT NULL,
        item_bought_price bigint unsigned NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id, user_id)
      )
    `)
  }

  override async down(): Promise<void> {}
}
