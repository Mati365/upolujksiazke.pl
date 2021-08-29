/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class OptionalRelease1613652300616 implements MigrationInterface {
  name = 'OptionalRelease1613652300616';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_cd4b94f015953bbf58a7ca08b54"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "book_review_unique_reviewer_review"`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "releaseId" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."releaseId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "book_review_unique_reviewer_review" UNIQUE ("bookId", "reviewerId")`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_cd4b94f015953bbf58a7ca08b54" FOREIGN KEY ("releaseId") REFERENCES "book_release"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_cd4b94f015953bbf58a7ca08b54"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "book_review_unique_reviewer_review"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."releaseId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "releaseId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "book_review_unique_reviewer_review" UNIQUE ("bookId", "reviewerId", "releaseId")`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_cd4b94f015953bbf58a7ca08b54" FOREIGN KEY ("releaseId") REFERENCES "book_release"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }
}
