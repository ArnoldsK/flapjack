import { MigrationInterface, QueryRunner } from "typeorm"

export class Update1724804519233 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(/* sql */ `
      CREATE TABLE toxic_score_batch_entity (
        id int NOT NULL AUTO_INCREMENT PRIMARY KEY,
        body text NOT NULL,
        sent int(1) NOT NULL DEFAULT 0,
        remoteBatchId varchar(255) NULL,
        createdAt datetime NOT NULL
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}
