/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RemoveReviewerUniqueIndex1613652589049 implements MigrationInterface {
  name = 'RemoveReviewerUniqueIndex1613652589049';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "book_reviewer_unique_website_name"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "book_reviewer_unique_website_name" UNIQUE ("name", "websiteId")`);
  }
}
