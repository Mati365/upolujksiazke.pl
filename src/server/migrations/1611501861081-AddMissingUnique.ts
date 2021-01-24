/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddMissingUnique1611501861081 implements MigrationInterface {
  name = 'AddMissingUnique1611501861081';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "book_reviewer_unique_remote" UNIQUE ("websiteId", "remoteId")`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_remote" UNIQUE ("websiteId", "remoteId")`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "book_review_unique_remote" UNIQUE ("websiteId", "remoteId")`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD CONSTRAINT "scrapper_metadata_unique_remote" UNIQUE ("websiteId", "remoteId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP CONSTRAINT "scrapper_metadata_unique_remote"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "book_review_unique_remote"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_remote"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "book_reviewer_unique_remote"`);
  }
}
