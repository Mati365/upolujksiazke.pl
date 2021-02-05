/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RemoveNotUsedMetadataStatus1612528284865 implements MigrationInterface {
  name = 'RemoveNotUsedMetadataStatus1612528284865';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."scrapper_metadata_status_enum" RENAME TO "scrapper_metadata_status_enum_old"`);
    await queryRunner.query(`CREATE TYPE "scrapper_metadata_status_enum" AS ENUM('1', '2')`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "status" TYPE "scrapper_metadata_status_enum" USING "status"::"text"::"scrapper_metadata_status_enum"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "status" SET DEFAULT '2'`);
    await queryRunner.query(`DROP TYPE "scrapper_metadata_status_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."status" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "status" SET DEFAULT '2'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "status" SET DEFAULT '3'`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_metadata"."status" IS NULL`);
    await queryRunner.query(`CREATE TYPE "scrapper_metadata_status_enum_old" AS ENUM('1', '2', '3')`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "status" TYPE "scrapper_metadata_status_enum_old" USING "status"::"text"::"scrapper_metadata_status_enum_old"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ALTER COLUMN "status" SET DEFAULT '2'`);
    await queryRunner.query(`DROP TYPE "scrapper_metadata_status_enum"`);
    await queryRunner.query(`ALTER TYPE "scrapper_metadata_status_enum_old" RENAME TO  "scrapper_metadata_status_enum"`);
  }
}
