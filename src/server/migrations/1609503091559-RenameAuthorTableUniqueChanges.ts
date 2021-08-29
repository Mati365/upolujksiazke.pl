/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RenameAuthorTableUniqueChanges1609503091559 implements MigrationInterface {
  name = 'RenameAuthorTableUniqueChanges1609503091559';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('author', 'book_author');
    await queryRunner.renameTable('book_authors_author', 'book_authors_book_author');

    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "description" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."description" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "book"."description" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "description" SET NOT NULL`);

    await queryRunner.renameTable('book_authors_book_author', 'book_authors_author');
    await queryRunner.renameTable('book_author', 'author');
  }
}
