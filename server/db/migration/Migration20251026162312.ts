import { Migration } from "@mikro-orm/migrations"

export class Migration20251026162312 extends Migration {
  override async up(): Promise<void> {
    await this.execute(/* sql */ `
      UPDATE gear_entity SET weapon_variant = "oneHanded" WHERE slot = "oneHanded";
    `)
    await this.execute(/* sql */ `
      UPDATE gear_entity SET weapon_variant = "twoHanded" WHERE slot = "twoHanded";
    `)
    await this.execute(/* sql */ `
      UPDATE gear_entity SET slot = "weapon" WHERE slot = "oneHanded" OR slot = "twoHanded";
    `)
  }

  override async down(): Promise<void> {}
}
