/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddRemoteArticle1618223487623 implements MigrationInterface {
  name = 'AddRemoteArticle1618223487623';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "scrapper_article" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" text, "remoteId" text, "websiteId" integer NOT NULL, "publishDate" TIMESTAMP, "title" text, "description" text, CONSTRAINT "PK_d2ae87cea449a20625095cc4ac5" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "scrapper_article_cover_attachments" ("scrapperArticleId" integer NOT NULL, "imageAttachmentsId" integer NOT NULL, CONSTRAINT "PK_6425e21c0d26eaa5a6a99345929" PRIMARY KEY ("scrapperArticleId", "imageAttachmentsId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_9e73584654c82404987f60acdc" ON "scrapper_article_cover_attachments" ("scrapperArticleId") `);
    await queryRunner.query(`CREATE INDEX "IDX_f7908ca940d5090ff0f86dda13" ON "scrapper_article_cover_attachments" ("imageAttachmentsId") `);
    await queryRunner.query(`ALTER TABLE "scrapper_article" ADD CONSTRAINT "FK_e496bf79b1a9f8bd3003e5969e0" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "scrapper_article_cover_attachments" ADD CONSTRAINT "FK_9e73584654c82404987f60acdc0" FOREIGN KEY ("scrapperArticleId") REFERENCES "scrapper_article"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "scrapper_article_cover_attachments" ADD CONSTRAINT "FK_f7908ca940d5090ff0f86dda13a" FOREIGN KEY ("imageAttachmentsId") REFERENCES "image_attachments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_article_cover_attachments" DROP CONSTRAINT "FK_f7908ca940d5090ff0f86dda13a"`);
    await queryRunner.query(`ALTER TABLE "scrapper_article_cover_attachments" DROP CONSTRAINT "FK_9e73584654c82404987f60acdc0"`);
    await queryRunner.query(`ALTER TABLE "scrapper_article" DROP CONSTRAINT "FK_e496bf79b1a9f8bd3003e5969e0"`);
    await queryRunner.query(`DROP INDEX "IDX_f7908ca940d5090ff0f86dda13"`);
    await queryRunner.query(`DROP INDEX "IDX_9e73584654c82404987f60acdc"`);
    await queryRunner.query(`DROP TABLE "scrapper_article_cover_attachments"`);
    await queryRunner.query(`DROP TABLE "scrapper_article"`);
  }
}
