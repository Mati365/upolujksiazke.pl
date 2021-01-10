/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddFieldsToRemoteRecord1610278747399 implements MigrationInterface {
  name = 'AddFieldsToRemoteRecord1610278747399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "book" ADD "remoteId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_efd835439a820b87727ebfa9169" UNIQUE ("remoteId")`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" DROP CONSTRAINT "unique_remote_entry"`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ALTER COLUMN "remoteId" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_remote_record"."remoteId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ADD CONSTRAINT "unique_remote_entry" UNIQUE ("remoteId", "websiteId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_efd835439a820b87727ebfa9169" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_efd835439a820b87727ebfa9169"`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" DROP CONSTRAINT "unique_remote_entry"`);
    await queryRunner.query(`COMMENT ON COLUMN "scrapper_remote_record"."remoteId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ALTER COLUMN "remoteId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ADD CONSTRAINT "unique_remote_entry" UNIQUE ("remoteId", "websiteId")`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_efd835439a820b87727ebfa9169"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" DROP COLUMN "showOnlyAsQuote"`);
  }
}
