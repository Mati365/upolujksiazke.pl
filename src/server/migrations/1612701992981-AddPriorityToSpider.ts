/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddPriorityToSpider1612701992981 implements MigrationInterface {
  name = 'AddPriorityToSpider1612701992981';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" ADD "priority" integer NOT NULL DEFAULT '0'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_spider_queue" DROP COLUMN "priority"`);
  }
}
