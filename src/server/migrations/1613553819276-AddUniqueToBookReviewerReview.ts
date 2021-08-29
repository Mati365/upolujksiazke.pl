/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddUniqueToBookReviewerReview1613553819276 implements MigrationInterface {
  name = 'AddUniqueToBookReviewerReview1613553819276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "book_review_unique_reviewer_review" UNIQUE ("bookId", "releaseId", "reviewerId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "book_review_unique_reviewer_review"`);
  }
}
