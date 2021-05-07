/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddHierarchicIndexToSeries1620376140502 implements MigrationInterface {
  name = 'AddHierarchicIndexToSeries1620376140502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "book"."scrappersIds" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "scrappersIds" SET DEFAULT '{}'::int[]`);
    await queryRunner.query(`CREATE INDEX "IDX_5e8b65cdc8d4fc67d95bf7683b" ON "book_series" ("hierarchic") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_5e8b65cdc8d4fc67d95bf7683b"`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "scrappersIds" SET DEFAULT '{}'`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."scrappersIds" IS NULL`);
  }
}
