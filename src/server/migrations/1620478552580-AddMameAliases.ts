/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddnameAliases1620478552580 implements MigrationInterface {
  name = 'AddnameAliases1620478552580';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_category" ADD "nameAliases" text array`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_category" DROP COLUMN "nameAliases"`);
  }
}
