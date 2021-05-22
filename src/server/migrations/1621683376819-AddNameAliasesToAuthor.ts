/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddNameAliasesToAuthor1621683376819 implements MigrationInterface {
  name = 'AddNameAliasesToAuthor1621683376819';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_author" ADD "nameAliases" text array`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "nameAliases"`);
  }
}
