/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixRatingStatsInBookEntity1615310093750 implements MigrationInterface {
  name = 'FixRatingStatsInBookEntity1615310093750';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "summarizedStatsUpvotes"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "summarizedStatsDownvotes"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "summarizedStatsComments"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "avgRating" double precision`);
    await queryRunner.query(`ALTER TABLE "book" ADD "totalRatings" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "totalRatings"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "avgRating"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "summarizedStatsComments" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book" ADD "summarizedStatsDownvotes" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book" ADD "summarizedStatsUpvotes" integer NOT NULL DEFAULT '0'`);
  }
}
