/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddTitleAndLangToRelease1610016887368 implements MigrationInterface {
  name = 'AddTitleAndLangToRelease1610016887368';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalLanguage"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "firstPublishDate"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "title" text`);
    await queryRunner.query(`CREATE TYPE "book_release_lang_enum" AS ENUM('en', 'pl')`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "lang" "book_release_lang_enum"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalReleaseId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_2ca9f209a95887580aa85a0dc68" UNIQUE ("originalReleaseId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_2ca9f209a95887580aa85a0dc68" FOREIGN KEY ("originalReleaseId") REFERENCES "book_release"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_2ca9f209a95887580aa85a0dc68"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_2ca9f209a95887580aa85a0dc68"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalReleaseId"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "lang"`);
    await queryRunner.query(`DROP TYPE "book_release_lang_enum"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "firstPublishDate" text`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalLanguage" text`);
  }
}
