/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddConstantStats1624619329251 implements MigrationInterface {
  name = 'AddConstantStats1624619329251';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ADD "initialConstantStatsUpvotes" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "initialConstantStatsDownvotes" integer NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "initialConstantStatsDownvotes"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "initialConstantStatsUpvotes"`);
  }
}
