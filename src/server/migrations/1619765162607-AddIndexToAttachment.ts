/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddIndexToAttachment1619765162607 implements MigrationInterface {
  name = 'AddIndexToAttachment1619765162607';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "book"."scrappersIds" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "scrappersIds" SET DEFAULT '{}'::int[]`);
    await queryRunner.query(`CREATE INDEX "IDX_557af1641cd85cf0daa97c9dca" ON "image_attachments" ("version") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_557af1641cd85cf0daa97c9dca"`);
    await queryRunner.query(`ALTER TABLE "book" ALTER COLUMN "scrappersIds" SET DEFAULT '{}'`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."scrappersIds" IS NULL`);
  }
}
