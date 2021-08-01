/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddBrandEntity1627820155693 implements MigrationInterface {
  name = 'AddBrandEntity1627820155693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "brands" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parameterizedName" text NOT NULL, "name" text NOT NULL, "description" text, "websiteId" integer NOT NULL, CONSTRAINT "UQ_d2622125262d4c15bf659647826" UNIQUE ("parameterizedName"), CONSTRAINT "PK_b0c437120b624da1034a81fc561" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "brand_logo_image_attachments" ("brandsId" integer NOT NULL, "imageAttachmentsId" integer NOT NULL, CONSTRAINT "PK_34009a44dd20f9f9fa8a0bd560b" PRIMARY KEY ("brandsId", "imageAttachmentsId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_52b93cc97d58e656555202d05d" ON "brand_logo_image_attachments" ("brandsId") `);
    await queryRunner.query(`CREATE INDEX "IDX_945162d8b5fbb3cf9b775d3b09" ON "brand_logo_image_attachments" ("imageAttachmentsId") `);
    await queryRunner.query(`ALTER TABLE "brands" ADD CONSTRAINT "FK_ed6dd767b0a00055259cf63aa15" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "brand_logo_image_attachments" ADD CONSTRAINT "FK_52b93cc97d58e656555202d05d6" FOREIGN KEY ("brandsId") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    await queryRunner.query(`ALTER TABLE "brand_logo_image_attachments" ADD CONSTRAINT "FK_945162d8b5fbb3cf9b775d3b09d" FOREIGN KEY ("imageAttachmentsId") REFERENCES "image_attachments"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "brand_logo_image_attachments" DROP CONSTRAINT "FK_945162d8b5fbb3cf9b775d3b09d"`);
    await queryRunner.query(`ALTER TABLE "brand_logo_image_attachments" DROP CONSTRAINT "FK_52b93cc97d58e656555202d05d6"`);
    await queryRunner.query(`ALTER TABLE "brands" DROP CONSTRAINT "FK_ed6dd767b0a00055259cf63aa15"`);
    await queryRunner.query(`DROP INDEX "IDX_945162d8b5fbb3cf9b775d3b09"`);
    await queryRunner.query(`DROP INDEX "IDX_52b93cc97d58e656555202d05d"`);
    await queryRunner.query(`DROP TABLE "brand_logo_image_attachments"`);
    await queryRunner.query(`DROP TABLE "brands"`);
  }
}
