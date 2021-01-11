/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddDefaultTitleToBook1610354700657 implements MigrationInterface {
  name = 'AddDefaultTitleToBook1610354700657';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "defaultTitle" text NOT NULL`);
    await queryRunner.query(`CREATE UNIQUE INDEX "book_default_title_index" ON "book" ((LOWER("defaultTitle")))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "book_default_title_index"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "defaultTitle"`);
  }
}
