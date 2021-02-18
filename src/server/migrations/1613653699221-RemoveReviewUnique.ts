/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveReviewUnique1613653699221 implements MigrationInterface {
  name = 'RemoveReviewUnique1613653699221';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "book_review_unique_reviewer_review"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "book_review_unique_reviewer_review" UNIQUE ("bookId", "reviewerId")`);
  }
}
