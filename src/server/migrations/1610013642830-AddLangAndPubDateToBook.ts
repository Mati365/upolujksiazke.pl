/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddLangAndPubDateToBook1610013642830 implements MigrationInterface {
  name = 'AddLangAndPubDateToBook1610013642830';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "originalLanguage" text`);
    await queryRunner.query(`ALTER TABLE "book" ADD "firstPublishDate" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "firstPublishDate"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalLanguage"`);
  }
}
