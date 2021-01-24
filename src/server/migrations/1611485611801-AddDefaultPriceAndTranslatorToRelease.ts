/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddDefaultPriceAndTranslatorToRelease1611485611801 implements MigrationInterface {
  name = 'AddDefaultPriceAndTranslatorToRelease1611485611801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" ADD "translator" citext`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "defaultPrice" money`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "defaultPrice"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "translator"`);
  }
}
