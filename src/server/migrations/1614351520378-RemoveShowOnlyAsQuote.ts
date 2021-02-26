/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveShowOnlyAsQuote1614351520378 implements MigrationInterface {
  name = 'RemoveShowOnlyAsQuote1614351520378';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP COLUMN "showOnlyAsQuote"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "showOnlyAsQuote"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "showOnlyAsQuote"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP COLUMN "showOnlyAsQuote"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT true`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT true`);
  }
}
