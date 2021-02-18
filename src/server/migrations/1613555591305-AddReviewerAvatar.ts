/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddReviewerAvatar1613555591305 implements MigrationInterface {
  name = 'AddReviewerAvatar1613555591305';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "book_reviewer_avatar_attachments" ("bookReviewerId" integer NOT NULL, "imageAttachmentsId" integer NOT NULL, CONSTRAINT "PK_96ac372572b773d380f146011d0" PRIMARY KEY ("bookReviewerId", "imageAttachmentsId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_483409920259a7faab3596e6aa" ON "book_reviewer_avatar_attachments" ("bookReviewerId") `);
    await queryRunner.query(`CREATE INDEX "IDX_c12f4a4ce6048369111050406e" ON "book_reviewer_avatar_attachments" ("imageAttachmentsId") `);
    await queryRunner.query(`ALTER TABLE "book_reviewer_avatar_attachments" ADD CONSTRAINT "FK_483409920259a7faab3596e6aa1" FOREIGN KEY ("bookReviewerId") REFERENCES "book_reviewer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_reviewer_avatar_attachments" ADD CONSTRAINT "FK_c12f4a4ce6048369111050406e9" FOREIGN KEY ("imageAttachmentsId") REFERENCES "image_attachments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer_avatar_attachments" DROP CONSTRAINT "FK_c12f4a4ce6048369111050406e9"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer_avatar_attachments" DROP CONSTRAINT "FK_483409920259a7faab3596e6aa1"`);
    await queryRunner.query(`DROP INDEX "IDX_c12f4a4ce6048369111050406e"`);
    await queryRunner.query(`DROP INDEX "IDX_483409920259a7faab3596e6aa"`);
    await queryRunner.query(`DROP TABLE "book_reviewer_avatar_attachments"`);
  }
}
