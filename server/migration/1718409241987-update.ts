import { MigrationInterface, QueryRunner } from "typeorm"

export class Update1718409241987 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `
      UPDATE credits_entity SET credits = credits + banked
    `)
    await queryRunner.query(/* sql */ `
      ALTER TABLE credits_entity DROP COLUMN banked
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
