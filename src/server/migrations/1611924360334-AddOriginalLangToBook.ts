/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddOriginalLangToBook1611924360334 implements MigrationInterface {
  name = 'AddOriginalLangToBook1611924360334';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "book_originallang_enum" AS ENUM('en', 'pl')`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalLang" "book_originallang_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalLang"`);
    await queryRunner.query(`DROP TYPE "book_originallang_enum"`);
  }
}
