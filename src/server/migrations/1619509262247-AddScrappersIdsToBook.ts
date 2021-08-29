/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddScrappersIdsToBook1619509262247 implements MigrationInterface {
  name = 'AddScrappersIdsToBook1619509262247';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "scrappersIds" integer array DEFAULT '{}'::int[]`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "scrappersIds"`);
  }
}
