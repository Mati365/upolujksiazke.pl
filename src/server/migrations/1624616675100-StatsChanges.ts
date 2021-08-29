/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class StatsChanges1624616675100 implements MigrationInterface {
  name = 'StatsChanges1624616675100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "statsComments"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ADD "statsComments" integer NOT NULL DEFAULT '0'`);
  }
}
