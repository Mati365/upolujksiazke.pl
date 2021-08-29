/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class FixProcessedAt1612522951694 implements MigrationInterface {
  name = 'FixProcessedAt1612522951694';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "processedAt" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."processedAt" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."processedAt" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "processedAt" DROP NOT NULL`);
  }
}
