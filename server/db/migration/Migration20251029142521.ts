import { Migration } from "@mikro-orm/migrations"

export class Migration20251029142521 extends Migration {
  override async up(): Promise<void> {
    await this.execute(/* sql */ `
      UPDATE credits_entity
      INNER JOIN gear_entity ON gear_entity.user_id = credits_entity.user_id
      SET credits_entity.credits = credits_entity.credits + gear_entity.bought_price
      WHERE credits_entity.user_id = credits_entity.user_id;
    `)

    await this.execute(/* sql */ `
      DELETE FROM static_data_entity WHERE type = "osrsPrices";
    `)

    await this.execute(/* sql */ `
      DROP TABLE gear_entity;
    `)
  }

  override async down(): Promise<void> {}
}
