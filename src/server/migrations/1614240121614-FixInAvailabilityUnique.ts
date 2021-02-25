/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixInAvailabilityUnique1614240121614 implements MigrationInterface {
  name = 'FixInAvailabilityUnique1614240121614';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_book_website"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_remote"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_book_remote_website" UNIQUE ("bookId", "websiteId", "remoteId", "releaseId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_book_remote_website"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_remote" UNIQUE ("websiteId", "remoteId")`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_book_website" UNIQUE ("bookId", "websiteId", "releaseId")`);
  }
}
