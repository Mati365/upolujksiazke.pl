/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddSummarizedStats1615220082390 implements MigrationInterface {
  name = 'AddSummarizedStats1615220082390';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "summarizedStatsUpvotes" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book" ADD "summarizedStatsDownvotes" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book" ADD "summarizedStatsComments" integer NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "summarizedStatsComments"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "summarizedStatsDownvotes"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "summarizedStatsUpvotes"`);
  }
}
