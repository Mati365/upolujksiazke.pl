/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class DropRemoteRecordRelation1611499107548 implements MigrationInterface {
  name = 'DropRemoteRecordRelation1611499107548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "FK_767582b2b44d87666925d57e96e"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_5e2e479d0fae4458805ce7ee8e5"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_7bf970df43e800a9e87ac39f420"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP CONSTRAINT "FK_4fab34ecec1e5c9eef22e75c1ea"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD "url" text`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "url" text`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "websiteId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "url" text`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "websiteId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD "showOnlyAsQuote" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD "url" text`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD "websiteId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "REL_767582b2b44d87666925d57e96"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD "remoteId" text`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "REL_5e2e479d0fae4458805ce7ee8e"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "remoteId" text`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "REL_7bf970df43e800a9e87ac39f42"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "remoteId" text`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP CONSTRAINT "REL_4fab34ecec1e5c9eef22e75c1e"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD "remoteId" text`);
    await queryRunner.query(`CREATE INDEX "IDX_796741305dbe12b74e67cff381" ON "book_availability" ("bookId") `);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_website" UNIQUE ("bookId", "volumeId", "websiteId")`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_fa2006b0c2f740b56be14bc6e72" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_612839fcb95bdb7728b291e0e4f" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD CONSTRAINT "FK_849462bcbda3c19d2f203554936" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP CONSTRAINT "FK_849462bcbda3c19d2f203554936"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_612839fcb95bdb7728b291e0e4f"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_fa2006b0c2f740b56be14bc6e72"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_website"`);
    await queryRunner.query(`DROP INDEX "IDX_796741305dbe12b74e67cff381"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD "remoteId" integer`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD CONSTRAINT "REL_4fab34ecec1e5c9eef22e75c1e" UNIQUE ("remoteId")`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "remoteId" integer`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "REL_7bf970df43e800a9e87ac39f42" UNIQUE ("remoteId")`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "remoteId" integer`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "REL_5e2e479d0fae4458805ce7ee8e" UNIQUE ("remoteId")`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD "remoteId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "REL_767582b2b44d87666925d57e96" UNIQUE ("remoteId")`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP COLUMN "websiteId"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP COLUMN "showOnlyAsQuote"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "websiteId"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "showOnlyAsQuote"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "websiteId"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "showOnlyAsQuote"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP COLUMN "showOnlyAsQuote"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD CONSTRAINT "FK_4fab34ecec1e5c9eef22e75c1ea" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_7bf970df43e800a9e87ac39f420" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_5e2e479d0fae4458805ce7ee8e5" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "FK_767582b2b44d87666925d57e96e" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
