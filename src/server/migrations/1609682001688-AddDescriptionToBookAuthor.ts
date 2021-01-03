/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddDescriptionToBookAuthor1609682001688 implements MigrationInterface {
  name = 'AddDescriptionToBookAuthor1609682001688';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_author" ADD "description" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "description"`);
  }
}
