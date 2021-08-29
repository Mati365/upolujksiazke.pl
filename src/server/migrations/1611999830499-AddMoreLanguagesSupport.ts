/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddMoreLanguagesSupport1611999830499 implements MigrationInterface {
  name = 'AddMoreLanguagesSupport1611999830499';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."book_release_lang_enum" RENAME TO "book_release_lang_enum_old"`);
    await queryRunner.query(`CREATE TYPE "book_release_lang_enum" AS ENUM('en', 'es', 'de', 'ru', 'ukr', 'pl', 'fr', 'it')`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "lang" TYPE "book_release_lang_enum" USING "lang"::"text"::"book_release_lang_enum"`);
    await queryRunner.query(`DROP TYPE "book_release_lang_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."lang" IS NULL`);
    await queryRunner.query(`ALTER TYPE "public"."book_originallang_enum" RENAME TO "book_originallang_enum_old"`);
    await queryRunner.query(`CREATE TYPE "book_originallang_enum" AS ENUM('en', 'es', 'de', 'ru', 'ukr', 'pl', 'fr', 'it')`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "originalLang" TYPE "book_originallang_enum" USING "originalLang"::"text"::"book_originallang_enum"`);
    await queryRunner.query(`DROP TYPE "book_originallang_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."originalLang" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "book"."originalLang" IS NULL`);
    await queryRunner.query(`CREATE TYPE "book_originallang_enum_old" AS ENUM('en', 'pl')`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "originalLang" TYPE "book_originallang_enum_old" USING "originalLang"::"text"::"book_originallang_enum_old"`);
    await queryRunner.query(`DROP TYPE "book_originallang_enum"`);
    await queryRunner.query(`ALTER TYPE "book_originallang_enum_old" RENAME TO  "book_originallang_enum"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."lang" IS NULL`);
    await queryRunner.query(`CREATE TYPE "book_release_lang_enum_old" AS ENUM('en', 'pl')`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "lang" TYPE "book_release_lang_enum_old" USING "lang"::"text"::"book_release_lang_enum_old"`);
    await queryRunner.query(`DROP TYPE "book_release_lang_enum"`);
    await queryRunner.query(`ALTER TYPE "book_release_lang_enum_old" RENAME TO  "book_release_lang_enum"`);
  }
}
