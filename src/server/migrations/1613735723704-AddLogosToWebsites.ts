/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddLogosToWebsites1613735723704 implements MigrationInterface {
  name = 'AddLogosToWebsites1613735723704';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "scrapper_website_logo_attachments" ("scrapperWebsiteId" integer NOT NULL, "imageAttachmentsId" integer NOT NULL, CONSTRAINT "PK_102a0bb5522be5dd34432601abf" PRIMARY KEY ("scrapperWebsiteId", "imageAttachmentsId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_0b756b58f19410acfce7ada1b8" ON "scrapper_website_logo_attachments" ("scrapperWebsiteId") `);
    await queryRunner.query(`CREATE INDEX "IDX_c637c41ae2a046400bbb570670" ON "scrapper_website_logo_attachments" ("imageAttachmentsId") `);
    await queryRunner.query(`ALTER TABLE "scrapper_website" DROP COLUMN "faviconUrl"`);
    await queryRunner.query(`ALTER TABLE "scrapper_website_logo_attachments" ADD CONSTRAINT "FK_0b756b58f19410acfce7ada1b8e" FOREIGN KEY ("scrapperWebsiteId") REFERENCES "scrapper_website"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "scrapper_website_logo_attachments" ADD CONSTRAINT "FK_c637c41ae2a046400bbb5706706" FOREIGN KEY ("imageAttachmentsId") REFERENCES "image_attachments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_website_logo_attachments" DROP CONSTRAINT "FK_c637c41ae2a046400bbb5706706"`);
    await queryRunner.query(`ALTER TABLE "scrapper_website_logo_attachments" DROP CONSTRAINT "FK_0b756b58f19410acfce7ada1b8e"`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ADD "faviconUrl" text`);
    await queryRunner.query(`DROP INDEX "IDX_c637c41ae2a046400bbb570670"`);
    await queryRunner.query(`DROP INDEX "IDX_0b756b58f19410acfce7ada1b8"`);
    await queryRunner.query(`DROP TABLE "scrapper_website_logo_attachments"`);
  }
}
