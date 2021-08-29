/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RenameUniqueInSpiderQueue1612697641166 implements MigrationInterface {
  name = 'RenameUniqueInSpiderQueue1612697641166';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" DROP CONSTRAINT "UQ_d663530191f613c9c1b1e9ea75c"`);
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" ADD CONSTRAINT "spider_queue_unique_website_path" UNIQUE ("websiteId", "path")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" DROP CONSTRAINT "spider_queue_unique_website_path"`);
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" ADD CONSTRAINT "UQ_d663530191f613c9c1b1e9ea75c" UNIQUE ("path", "websiteId")`);
  }
}
