/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixTranslatorAgain1617371476715 implements MigrationInterface {
  name = 'FixTranslatorAgain1617371476715';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "translator"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "translator" text array`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "translator"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "translator" citext`);
  }
}
