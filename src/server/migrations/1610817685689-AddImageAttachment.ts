/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddImageAttachment1610817685689 implements MigrationInterface {
  name = 'AddImageAttachment1610817685689';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_c4020304ee17ccfdef1f5045ac6"`);
    await queryRunner.query(`CREATE TYPE "image_attachments_version_enum" AS ENUM('SMALL_THUMB', 'THUMB', 'PREVIEW', 'BIG')`);
    await queryRunner.query(`CREATE TABLE "image_attachments" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "version" "image_attachments_version_enum" NOT NULL, "nsfw" boolean NOT NULL DEFAULT false, "ratio" double precision, "attachmentId" integer NOT NULL, CONSTRAINT "REL_c36b310f15131a773a01822d92" UNIQUE ("attachmentId"), CONSTRAINT "PK_39ac624b338e3029fe47e080495" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "nsfw"`);
    await queryRunner.query(`ALTER TABLE "attachments" DROP COLUMN "ratio"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "coverId"`);
    await queryRunner.query(`ALTER TABLE "attachments" ALTER COLUMN "name" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "attachments"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "image_attachments" ADD CONSTRAINT "FK_c36b310f15131a773a01822d92c" FOREIGN KEY ("attachmentId") REFERENCES "attachments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "image_attachments" DROP CONSTRAINT "FK_c36b310f15131a773a01822d92c"`);
    await queryRunner.query(`COMMENT ON COLUMN "attachments"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "attachments" ALTER COLUMN "name" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "coverId" integer`);
    await queryRunner.query(`ALTER TABLE "attachments" ADD "ratio" double precision`);
    await queryRunner.query(`ALTER TABLE "attachments" ADD "nsfw" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`DROP TABLE "image_attachments"`);
    await queryRunner.query(`DROP TYPE "image_attachments_version_enum"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_c4020304ee17ccfdef1f5045ac6" FOREIGN KEY ("coverId") REFERENCES "attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
