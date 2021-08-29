/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class ChangeSomeTitlesTypes1610523993426 implements MigrationInterface {
  name = 'ChangeSomeTitlesTypes1610523993426';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_122f25c4152cd96d53c87dc0bb"`);
    await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b"`);
    await queryRunner.query(`ALTER TABLE "tag" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "tag" ADD "name" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "book_author" DROP CONSTRAINT "UQ_b62b34248c72f89fb6d27895e03"`);
    await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "book_author" ADD "name" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_author" ADD CONSTRAINT "UQ_b62b34248c72f89fb6d27895e03" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP CONSTRAINT "UQ_e5c2172676f335ef6a0e6335a7e"`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD "name" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD CONSTRAINT "UQ_e5c2172676f335ef6a0e6335a7e" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ADD "url" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ADD CONSTRAINT "UQ_122f25c4152cd96d53c87dc0bb3" UNIQUE ("url")`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "book_release_unique_publisher_edition"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "title" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "edition"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "edition" citext`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "defaultTitle"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "defaultTitle" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_3af9932cb0ff55d0324c211aedd" UNIQUE ("defaultTitle")`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "book_release_unique_publisher_edition" UNIQUE ("title", "publisherId", "edition")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "book_release_unique_publisher_edition"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_3af9932cb0ff55d0324c211aedd"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "defaultTitle"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "defaultTitle" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "edition"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "edition" text`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "title" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "book_release_unique_publisher_edition" UNIQUE ("publisherId", "edition", "title")`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" DROP CONSTRAINT "UQ_122f25c4152cd96d53c87dc0bb3"`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" DROP COLUMN "url"`);
    await queryRunner.query(`ALTER TABLE "scrapper_website" ADD "url" character varying NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP CONSTRAINT "UQ_e5c2172676f335ef6a0e6335a7e"`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD "name" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD CONSTRAINT "UQ_e5c2172676f335ef6a0e6335a7e" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "book_author" DROP CONSTRAINT "UQ_b62b34248c72f89fb6d27895e03"`);
    await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "book_author" ADD "name" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_author" ADD CONSTRAINT "UQ_b62b34248c72f89fb6d27895e03" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b"`);
    await queryRunner.query(`ALTER TABLE "tag" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "tag" ADD "name" character varying(60) NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name")`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_122f25c4152cd96d53c87dc0bb" ON "scrapper_website" ("url") `);
  }
}
