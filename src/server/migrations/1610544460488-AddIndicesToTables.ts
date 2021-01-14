/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddIndicesToTables1610544460488 implements MigrationInterface {
  name = 'AddIndicesToTables1610544460488';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD "websiteId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "releaseId" integer NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_63a14e7154df08ac31baca98e4" ON "book_reviewer" ("websiteId") `);
    await queryRunner.query(`CREATE INDEX "IDX_53231db1ba83c2c270dc8f54af" ON "book_volume" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_c26c36fe0f31695f20716ac5e9" ON "book_release" ("volumeId") `);
    await queryRunner.query(`CREATE INDEX "IDX_0cbd0caed48b7acdd31f56bdc7" ON "book_release" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_d47a02807234f545466e113ca0" ON "book_review" ("bookId") `);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "book_reviewer_unique_website_name" UNIQUE ("name", "websiteId")`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "FK_63a14e7154df08ac31baca98e4d" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_cd4b94f015953bbf58a7ca08b54" FOREIGN KEY ("releaseId") REFERENCES "book_release"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_cd4b94f015953bbf58a7ca08b54"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "FK_63a14e7154df08ac31baca98e4d"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "book_reviewer_unique_website_name"`);
    await queryRunner.query(`DROP INDEX "IDX_d47a02807234f545466e113ca0"`);
    await queryRunner.query(`DROP INDEX "IDX_0cbd0caed48b7acdd31f56bdc7"`);
    await queryRunner.query(`DROP INDEX "IDX_c26c36fe0f31695f20716ac5e9"`);
    await queryRunner.query(`DROP INDEX "IDX_53231db1ba83c2c270dc8f54af"`);
    await queryRunner.query(`DROP INDEX "IDX_63a14e7154df08ac31baca98e4"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "releaseId"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP COLUMN "websiteId"`);
  }
}
