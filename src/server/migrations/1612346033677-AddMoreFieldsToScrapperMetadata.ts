/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddMoreFieldsToScrapperMetadata1612346033677 implements MigrationInterface {
  name = 'AddMoreFieldsToScrapperMetadata1612346033677';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD "parserSource" text`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "content" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."content" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."content" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "content" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP COLUMN "parserSource"`);
  }
}
