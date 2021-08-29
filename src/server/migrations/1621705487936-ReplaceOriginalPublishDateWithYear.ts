/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class ReplaceOriginalPublishDateWithYear1621705487936 implements MigrationInterface {
  name = 'ReplaceOriginalPublishDateWithYear1621705487936';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" RENAME COLUMN "originalPublishDate" TO "originalPublishYear"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalPublishYear"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalPublishYear" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalPublishYear"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalPublishYear" text`);
    await queryRunner.query(`ALTER TABLE "book" RENAME COLUMN "originalPublishYear" TO "originalPublishDate"`);
  }
}
