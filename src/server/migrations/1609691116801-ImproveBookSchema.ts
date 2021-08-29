/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class ImproveBookSchema1609691116801 implements MigrationInterface {
  name = 'ImproveBookSchema1609691116801';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "nick"`);
    await queryRunner.query(`ALTER TABLE "attachments" ADD "nsfw" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "attachments" ADD "ratio" double precision`);
    await queryRunner.query(`ALTER TABLE "attachments" ADD "sourceUrl" text`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "publishDate" TIMESTAMP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "reviewerId" integer`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "statsUpvotes" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "statsDownvotes" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "statsComments" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "publishDate" TIMESTAMP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book" ADD "coverId" integer`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "rating" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."rating" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_0a68fff977ba91dae6780fc00cd" FOREIGN KEY ("reviewerId") REFERENCES "book_reviewer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_ea921939b25c4a315e461fc886e" FOREIGN KEY ("coverId") REFERENCES "attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_ea921939b25c4a315e461fc886e"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_0a68fff977ba91dae6780fc00cd"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."rating" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "rating" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "coverId"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "publishDate"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "statsComments"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "statsDownvotes"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "statsUpvotes"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "reviewerId"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "publishDate"`);
    await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "sourceUrl"`);
    await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "ratio"`);
    await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "nsfw"`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "nick" text NOT NULL`);
  }
}
