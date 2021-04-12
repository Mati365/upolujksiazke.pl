/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBookSummary1618232214277 implements MigrationInterface {
  name = 'AddBookSummary1618232214277';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "book_summary_header" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parameterizedTitle" text NOT NULL, "title" citext NOT NULL, "url" text NOT NULL, "summaryId" integer, CONSTRAINT "book_summary_header_unique_title_url" UNIQUE ("title", "url"), CONSTRAINT "PK_f806a1ce42ec865f3737ca5c87a" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_d036a66bc95c2190898d4d0fc4" ON "book_summary_header" ("summaryId") `);
    await queryRunner.query(`CREATE TABLE "book_summary" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "bookId" integer NOT NULL, "articleId" integer, CONSTRAINT "REL_aad73744fb5c7c9314ed1c0e4f" UNIQUE ("articleId"), CONSTRAINT "PK_e41f4a223fb0b77180f14cd5fd3" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_17de51f0880e6ecc1f95e648ef" ON "book_summary" ("bookId") `);
    await queryRunner.query(`ALTER TABLE "book_summary_header" ADD CONSTRAINT "FK_d036a66bc95c2190898d4d0fc44" FOREIGN KEY ("summaryId") REFERENCES "book_summary"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_summary" ADD CONSTRAINT "FK_17de51f0880e6ecc1f95e648ef9" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_summary" ADD CONSTRAINT "FK_aad73744fb5c7c9314ed1c0e4f8" FOREIGN KEY ("articleId") REFERENCES "scrapper_article"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_summary" DROP CONSTRAINT "FK_aad73744fb5c7c9314ed1c0e4f8"`);
    await queryRunner.query(`ALTER TABLE "book_summary" DROP CONSTRAINT "FK_17de51f0880e6ecc1f95e648ef9"`);
    await queryRunner.query(`ALTER TABLE "book_summary_header" DROP CONSTRAINT "FK_d036a66bc95c2190898d4d0fc44"`);
    await queryRunner.query(`DROP INDEX "IDX_17de51f0880e6ecc1f95e648ef"`);
    await queryRunner.query(`DROP TABLE "book_summary"`);
    await queryRunner.query(`DROP INDEX "IDX_d036a66bc95c2190898d4d0fc4"`);
    await queryRunner.query(`DROP TABLE "book_summary_header"`);
  }
}
