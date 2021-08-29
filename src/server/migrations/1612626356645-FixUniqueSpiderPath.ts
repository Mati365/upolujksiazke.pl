/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixUniqueSpiderPath1612626356645 implements MigrationInterface {
  name = 'FixUniqueSpiderPath1612626356645';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_spider_queue"."path" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" DROP CONSTRAINT "UQ_221e3d6db53906bffcf88c2a686"`);
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" ADD CONSTRAINT "UQ_d663530191f613c9c1b1e9ea75c" UNIQUE ("websiteId", "path")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" DROP CONSTRAINT "UQ_d663530191f613c9c1b1e9ea75c"`);
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" ADD CONSTRAINT "UQ_221e3d6db53906bffcf88c2a686" UNIQUE ("path")`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_spider_queue"."path" IS NULL`);
  }
}
