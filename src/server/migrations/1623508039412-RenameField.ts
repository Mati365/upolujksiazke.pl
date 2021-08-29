/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class RenameField1623508039412 implements MigrationInterface {
  name = 'RenameField1623508039412';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" RENAME COLUMN "totalReviews" TO "totalTextReviews"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" RENAME COLUMN "totalTextReviews" TO "totalReviews"`);
  }
}
