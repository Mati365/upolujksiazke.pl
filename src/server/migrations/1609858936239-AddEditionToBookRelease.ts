/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddEditionToBookRelease1609858936239 implements MigrationInterface {
  name = 'AddEditionToBookRelease1609858936239';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" ADD "edition" text`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "publishDate" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."publishDate" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "format" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."format" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."format" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "format" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."publishDate" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "publishDate" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "edition"`);
  }
}
