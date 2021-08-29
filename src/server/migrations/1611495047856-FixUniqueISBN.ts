/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixUniqueISBN1611495047856 implements MigrationInterface {
  name = 'FixUniqueISBN1611495047856';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "book_release_unique_publisher_edition"`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "isbn" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."isbn" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "UQ_b8534c4c9767a5f43697942f0ce" UNIQUE ("isbn")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "UQ_b8534c4c9767a5f43697942f0ce"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."isbn" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "isbn" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "book_release_unique_publisher_edition" UNIQUE ("publisherId", "title", "edition")`);
  }
}
