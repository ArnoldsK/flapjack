import { MigrationInterface, QueryRunner } from "typeorm"

export class Update1724801220030 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `
      CREATE TABLE toxic_score_entity (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        userId varchar(255) NOT NULL,
        score int NOT NULL,
        info text NOT NULL,
        createdAt datetime NOT NULL
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
