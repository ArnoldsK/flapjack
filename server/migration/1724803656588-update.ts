import { MigrationInterface, QueryRunner } from "typeorm"

export class Update1724803656588 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `
      ALTER TABLE toxic_score_entity ADD COLUMN messageId varchar(255) NOT NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
