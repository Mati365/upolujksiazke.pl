/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBrochureEntites1627826763973 implements MigrationInterface {
  name = 'AddBrochureEntites1627826763973';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "brochure_page" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "index" integer NOT NULL, "brochureId" integer, CONSTRAINT "PK_ca8eafe5efb95392ce992754ca8" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_6ccac6d0fe06ab8c563e7b6d2c" ON "brochure_page" ("brochureId") `);
    await queryRunner.query(`CREATE TABLE "brochure" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" text, "remoteId" text, "websiteId" integer NOT NULL, "title" text NOT NULL, "parameterizedName" text NOT NULL, "validFrom" TIMESTAMP, "validTo" TIMESTAMP, "brandId" integer NOT NULL, "totalPages" integer, CONSTRAINT "UQ_da1ba0a5602d5259c8c94a6e7ba" UNIQUE ("parameterizedName"), CONSTRAINT "brochure_unique_remote" UNIQUE ("websiteId", "remoteId"), CONSTRAINT "PK_2687d59a62f723bc48f6f41850c" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_04f96322a8f0d61b7a470e77d3" ON "brochure" ("brandId") `);
    await queryRunner.query(`CREATE TABLE "brochure_image_attachments" ("brochurePageId" integer NOT NULL, "imageAttachmentsId" integer NOT NULL, CONSTRAINT "PK_fce86686335c7993c0d76521288" PRIMARY KEY ("brochurePageId", "imageAttachmentsId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_c2d5cbd242e877620d52528f49" ON "brochure_image_attachments" ("brochurePageId") `);
    await queryRunner.query(`CREATE INDEX "IDX_3b40461931951f6016ccc5ac9b" ON "brochure_image_attachments" ("imageAttachmentsId") `);
    await queryRunner.query(`CREATE TABLE "brochure_tags_tag" ("brochureId" integer NOT NULL, "tagId" integer NOT NULL, CONSTRAINT "PK_08f0afee39e83fabfad5df63b89" PRIMARY KEY ("brochureId", "tagId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_606de1e4102e7e92c770cafd02" ON "brochure_tags_tag" ("brochureId") `);
    await queryRunner.query(`CREATE INDEX "IDX_5de75c84411387e37dcc7a2252" ON "brochure_tags_tag" ("tagId") `);
    await queryRunner.query(`ALTER TABLE "brochure_page" ADD CONSTRAINT "FK_6ccac6d0fe06ab8c563e7b6d2c5" FOREIGN KEY ("brochureId") REFERENCES "brochure"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "brochure" ADD CONSTRAINT "FK_ee284bd9489ba4588ed5a66faf3" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "brochure" ADD CONSTRAINT "FK_04f96322a8f0d61b7a470e77d37" FOREIGN KEY ("brandId") REFERENCES "brands"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "brochure_image_attachments" ADD CONSTRAINT "FK_c2d5cbd242e877620d52528f49b" FOREIGN KEY ("brochurePageId") REFERENCES "brochure_page"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "brochure_image_attachments" ADD CONSTRAINT "FK_3b40461931951f6016ccc5ac9ba" FOREIGN KEY ("imageAttachmentsId") REFERENCES "image_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "brochure_tags_tag" ADD CONSTRAINT "FK_606de1e4102e7e92c770cafd026" FOREIGN KEY ("brochureId") REFERENCES "brochure"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "brochure_tags_tag" ADD CONSTRAINT "FK_5de75c84411387e37dcc7a22527" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brochure_tags_tag" DROP CONSTRAINT "FK_5de75c84411387e37dcc7a22527"`);
    await queryRunner.query(`ALTER TABLE "brochure_tags_tag" DROP CONSTRAINT "FK_606de1e4102e7e92c770cafd026"`);
    await queryRunner.query(`ALTER TABLE "brochure_image_attachments" DROP CONSTRAINT "FK_3b40461931951f6016ccc5ac9ba"`);
    await queryRunner.query(`ALTER TABLE "brochure_image_attachments" DROP CONSTRAINT "FK_c2d5cbd242e877620d52528f49b"`);
    await queryRunner.query(`ALTER TABLE "brochure" DROP CONSTRAINT "FK_04f96322a8f0d61b7a470e77d37"`);
    await queryRunner.query(`ALTER TABLE "brochure" DROP CONSTRAINT "FK_ee284bd9489ba4588ed5a66faf3"`);
    await queryRunner.query(`ALTER TABLE "brochure_page" DROP CONSTRAINT "FK_6ccac6d0fe06ab8c563e7b6d2c5"`);
    await queryRunner.query(`DROP INDEX "IDX_5de75c84411387e37dcc7a2252"`);
    await queryRunner.query(`DROP INDEX "IDX_606de1e4102e7e92c770cafd02"`);
    await queryRunner.query(`DROP TABLE "brochure_tags_tag"`);
    await queryRunner.query(`DROP INDEX "IDX_3b40461931951f6016ccc5ac9b"`);
    await queryRunner.query(`DROP INDEX "IDX_c2d5cbd242e877620d52528f49"`);
    await queryRunner.query(`DROP TABLE "brochure_image_attachments"`);
    await queryRunner.query(`DROP INDEX "IDX_04f96322a8f0d61b7a470e77d3"`);
    await queryRunner.query(`DROP TABLE "brochure"`);
    await queryRunner.query(`DROP INDEX "IDX_6ccac6d0fe06ab8c563e7b6d2c"`);
    await queryRunner.query(`DROP TABLE "brochure_page"`);
  }
}
