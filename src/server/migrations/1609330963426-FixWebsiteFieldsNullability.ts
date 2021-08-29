/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixWebsiteFieldsNullability1609330963426 implements MigrationInterface {
  name = 'FixWebsiteFieldsNullability1609330963426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_website" ALTER COLUMN "description" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_website"."description" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ALTER COLUMN "title" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_website"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ALTER COLUMN "faviconUrl" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_website"."faviconUrl" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_website"."faviconUrl" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ALTER COLUMN "faviconUrl" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_website"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ALTER COLUMN "title" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_website"."description" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ALTER COLUMN "description" SET NOT NULL`);
  }
}
