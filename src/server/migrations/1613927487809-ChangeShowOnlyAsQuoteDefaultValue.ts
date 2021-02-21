/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class ChangeShowOnlyAsQuoteDefaultValue1613927487809 implements MigrationInterface {
  name = 'ChangeShowOnlyAsQuoteDefaultValue1613927487809';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "book_reviewer"."showOnlyAsQuote" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ALTER COLUMN "showOnlyAsQuote" SET DEFAULT true`);
    await queryRunner.query(`COMMENT ON COLUMN "book_availability"."showOnlyAsQuote" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "showOnlyAsQuote" SET DEFAULT true`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."showOnlyAsQuote" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "showOnlyAsQuote" SET DEFAULT true`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."showOnlyAsQuote" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "showOnlyAsQuote" SET DEFAULT true`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "showOnlyAsQuote" SET DEFAULT false`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."showOnlyAsQuote" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "showOnlyAsQuote" SET DEFAULT false`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."showOnlyAsQuote" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "showOnlyAsQuote" SET DEFAULT false`);
    await queryRunner.query(`COMMENT ON COLUMN "book_availability"."showOnlyAsQuote" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ALTER COLUMN "showOnlyAsQuote" SET DEFAULT false`);
    await queryRunner.query(`COMMENT ON COLUMN "book_reviewer"."showOnlyAsQuote" IS NULL`);
  }
}
