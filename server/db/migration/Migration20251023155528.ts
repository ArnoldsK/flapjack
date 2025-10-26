import { Migration } from "@mikro-orm/migrations"

export class Migration20251023155528 extends Migration {
  override async up(): Promise<void> {
    await this.execute(/* sql */ `
      CREATE TABLE gear_entity (
        id int NOT NULL AUTO_INCREMENT,
        user_id varchar(255) NOT NULL,
        item_id int NOT NULL,
        slot varchar(255) NOT NULL,
        weapon_variant varchar(255),
        name varchar(255) NOT NULL,
        bought_price bigint unsigned NOT NULL,
        created_at datetime DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      )
    `)
  }

  override async down(): Promise<void> {}
}
