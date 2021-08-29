/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddSpiderQueue1612625782128 implements MigrationInterface {
  name = 'AddSpiderQueue1612625782128';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "scrapper_spider_queue" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "path" text NOT NULL, "websiteId" integer NOT NULL, "processed" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_221e3d6db53906bffcf88c2a686" UNIQUE ("path"), CONSTRAINT "PK_888d5522f5fdc4fb2a1e267afb0" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_c93d490b392ec934a85b072ddc" ON "scrapper_spider_queue" ("processed", "websiteId") `);
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" ADD CONSTRAINT "FK_42ab0633ee19a2d03a7bef2a81d" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" DROP CONSTRAINT "FK_42ab0633ee19a2d03a7bef2a81d"`);
    await queryRunner.query(`DROP INDEX "IDX_c93d490b392ec934a85b072ddc"`);
    await queryRunner.query(`DROP TABLE "scrapper_spider_queue"`);
  }
}
