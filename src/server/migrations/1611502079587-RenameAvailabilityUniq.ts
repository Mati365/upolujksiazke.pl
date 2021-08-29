/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RenameAvailabilityUniq1611502079587 implements MigrationInterface {
  name = 'RenameAvailabilityUniq1611502079587';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_website"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_book_volume_website" UNIQUE ("bookId", "volumeId", "websiteId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_book_volume_website"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_website" UNIQUE ("bookId", "volumeId", "websiteId")`);
  }
}
