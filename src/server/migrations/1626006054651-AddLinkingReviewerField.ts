/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddLinkingReviewerField1626006054651 implements MigrationInterface {
  name = 'AddLinkingReviewerField1626006054651';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ADD "linkingReviewerId" integer`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "quote" boolean DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_d04956199912ae8c7ce6f3b0234" FOREIGN KEY ("linkingReviewerId") REFERENCES "book_reviewer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_d04956199912ae8c7ce6f3b0234"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "quote"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "linkingReviewerId"`);
  }
}
