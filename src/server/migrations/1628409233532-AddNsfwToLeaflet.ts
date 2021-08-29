/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddNsfwToLeaflet1628409233532 implements MigrationInterface {
  name = 'AddNsfwToLeaflet1628409233532';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."brochure" ADD "nsfw" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "public"."book" ALTER COLUMN "scrappersIds" DROP DEFAULT`);
    await queryRunner.query(`ALTER TYPE "public"."scrapper_metadata_kind_enum" RENAME TO "scrapper_metadata_kind_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."scrapper_metadata_kind_enum" AS ENUM('0', '1', '2', '3', '4', '5', '6')`);
    await queryRunner.query(`ALTER TABLE "public"."scrapper_metadata" ALTER COLUMN "kind" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "public"."scrapper_metadata" ALTER COLUMN "kind" TYPE "public"."scrapper_metadata_kind_enum" USING "kind"::"text"::"public"."scrapper_metadata_kind_enum"`);
    await queryRunner.query(`ALTER TABLE "public"."scrapper_metadata" ALTER COLUMN "kind" SET DEFAULT '1'`);
    await queryRunner.query(`DROP TYPE "public"."scrapper_metadata_kind_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."scrapper_metadata_kind_enum_old" AS ENUM('0', '1', '2', '3', '4', '5')`);
    await queryRunner.query(`ALTER TABLE "public"."scrapper_metadata" ALTER COLUMN "kind" DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE "public"."scrapper_metadata" ALTER COLUMN "kind" TYPE "public"."scrapper_metadata_kind_enum_old" USING "kind"::"text"::"public"."scrapper_metadata_kind_enum_old"`);
    await queryRunner.query(`ALTER TABLE "public"."scrapper_metadata" ALTER COLUMN "kind" SET DEFAULT '1'`);
    await queryRunner.query(`DROP TYPE "public"."scrapper_metadata_kind_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."scrapper_metadata_kind_enum_old" RENAME TO "scrapper_metadata_kind_enum"`);
    await queryRunner.query(`ALTER TABLE "public"."book" ALTER COLUMN "scrappersIds" SET DEFAULT '{}'`);
    await queryRunner.query(`ALTER TABLE "public"."brochure" DROP COLUMN "nsfw"`);
  }
}
