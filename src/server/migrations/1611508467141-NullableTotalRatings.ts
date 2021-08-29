/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class NullableTotalRatings1611508467141 implements MigrationInterface {
  name = 'NullableTotalRatings1611508467141';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "totalRatings" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_availability"."totalRatings" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "totalRatings" DROP DEFAULT`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "totalRatings" SET DEFAULT '0'`);
    await queryRunner.query(`COMMENT ON COLUMN "book_availability"."totalRatings" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "totalRatings" SET NOT NULL`);
  }
}
