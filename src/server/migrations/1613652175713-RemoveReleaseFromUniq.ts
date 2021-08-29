/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveReleaseFromUniq1613652175713 implements MigrationInterface {
  name = 'RemoveReleaseFromUniq1613652175713';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_0a68fff977ba91dae6780fc00cd"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_d47a02807234f545466e113ca0b"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "book_review_unique_reviewer_review"`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "reviewerId" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."reviewerId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "bookId" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."bookId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "book_review_unique_reviewer_review" UNIQUE ("bookId", "releaseId", "reviewerId")`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_0a68fff977ba91dae6780fc00cd" FOREIGN KEY ("reviewerId") REFERENCES "book_reviewer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_d47a02807234f545466e113ca0b" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_d47a02807234f545466e113ca0b"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_0a68fff977ba91dae6780fc00cd"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "book_review_unique_reviewer_review"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."bookId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "bookId" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."reviewerId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "reviewerId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "book_review_unique_reviewer_review" UNIQUE ("bookId", "reviewerId", "releaseId")`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_d47a02807234f545466e113ca0b" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_0a68fff977ba91dae6780fc00cd" FOREIGN KEY ("reviewerId") REFERENCES "book_reviewer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
