/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class OptionalISBNInBookRelease1610284016509 implements MigrationInterface {
  name = 'OptionalISBNInBookRelease1610284016509';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "unique_publisher_isbn"`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "isbn" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."isbn" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "unique_publisher_isbn" UNIQUE ("isbn", "publisherId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "unique_publisher_isbn"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."isbn" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "isbn" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "unique_publisher_isbn" UNIQUE ("isbn", "publisherId")`);
  }
}
