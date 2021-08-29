/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class ChangeUniqueKeyNames1610355026925 implements MigrationInterface {
  name = 'ChangeUniqueKeyNames1610355026925';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" DROP CONSTRAINT "unique_remote_entry"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "unique_publisher_edition"`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ADD CONSTRAINT "remote_record_unique_remote_entry" UNIQUE ("remoteId", "websiteId")`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "book_release_unique_publisher_edition" UNIQUE ("title", "publisherId", "edition")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "book_release_unique_publisher_edition"`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" DROP CONSTRAINT "remote_record_unique_remote_entry"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "unique_publisher_edition" UNIQUE ("publisherId", "edition", "title")`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ADD CONSTRAINT "unique_remote_entry" UNIQUE ("remoteId", "websiteId")`);
  }
}
