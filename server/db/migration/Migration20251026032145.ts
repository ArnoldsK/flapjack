import { Migration } from "@mikro-orm/migrations"

export class Migration20251026032145 extends Migration {
  override async up(): Promise<void> {
    await this.execute(/* sql */ `
      UPDATE osrs_items_entity SET item_slot = "weapon" WHERE item_slot = "oneHanded" OR item_slot = "twoHanded";
    `)
  }

  override async down(): Promise<void> {}
}
