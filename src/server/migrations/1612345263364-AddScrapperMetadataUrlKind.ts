/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddScrapperMetadataUrlKind1612345263364 implements MigrationInterface {
  name = 'AddScrapperMetadataUrlKind1612345263364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."scrapper_metadata_kind_enum" RENAME TO "scrapper_metadata_kind_enum_old"`);
    await queryRunner.query(`CREATE TYPE "scrapper_metadata_kind_enum" AS ENUM('0', '1', '2', '3', '4')`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "kind" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "kind" TYPE "scrapper_metadata_kind_enum" USING "kind"::"text"::"scrapper_metadata_kind_enum"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "kind" SET DEFAULT '1'`);
    await queryRunner.query(`DROP TYPE "scrapper_metadata_kind_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."kind" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."kind" IS NULL`);
    await queryRunner.query(`CREATE TYPE "scrapper_metadata_kind_enum_old" AS ENUM('1', '2', '3', '4')`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "kind" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "kind" TYPE "scrapper_metadata_kind_enum_old" USING "kind"::"text"::"scrapper_metadata_kind_enum_old"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "kind" SET DEFAULT '1'`);
    await queryRunner.query(`DROP TYPE "scrapper_metadata_kind_enum"`);
    await queryRunner.query(`ALTER TYPE "scrapper_metadata_kind_enum_old" RENAME TO  "scrapper_metadata_kind_enum"`);
  }
}
