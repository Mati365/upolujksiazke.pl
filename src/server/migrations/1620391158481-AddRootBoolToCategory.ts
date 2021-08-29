/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddRootBoolToCategory1620391158481 implements MigrationInterface {
  name = 'AddRootBoolToCategory1620391158481';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_category" ADD "root" boolean DEFAULT false`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."scrappersIds" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "scrappersIds" SET DEFAULT '{}'::int[]`);
    await queryRunner.query(`CREATE INDEX "IDX_d29b74968a8f0e1c21b3f64a6a" ON "book_category" ("root") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_d29b74968a8f0e1c21b3f64a6a"`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "scrappersIds" SET DEFAULT '{}'`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."scrappersIds" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP COLUMN "root"`);
  }
}
