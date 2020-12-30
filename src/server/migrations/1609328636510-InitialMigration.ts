/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class InitialMigration1609328636510 implements MigrationInterface {
  name = 'InitialMigration1609328636510';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "scrapper_website" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "url" character varying NOT NULL, "description" text NOT NULL, "title" text NOT NULL, "faviconUrl" text NOT NULL, CONSTRAINT "PK_5b1623beed79ac1f8d39f4e78d9" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_122f25c4152cd96d53c87dc0bb" ON "scrapper_website" ("url") `);
    await queryRunner.query(`CREATE TABLE "scrapper_remote_record" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "remoteId" text NOT NULL, "websiteId" integer NOT NULL, CONSTRAINT "unique_remote_entry" UNIQUE ("remoteId", "websiteId"), CONSTRAINT "PK_a226b14a7503cd146370914ca27" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "scrapper_metadata_kind_enum" AS ENUM('1')`);
    await queryRunner.query(`CREATE TYPE "scrapper_metadata_status_enum" AS ENUM('1', '2', '3')`);
    await queryRunner.query(`CREATE TABLE "scrapper_metadata" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "content" jsonb NOT NULL, "kind" "scrapper_metadata_kind_enum" NOT NULL DEFAULT '1', "status" "scrapper_metadata_status_enum" NOT NULL DEFAULT '3', "remoteId" integer, CONSTRAINT "REL_4fab34ecec1e5c9eef22e75c1e" UNIQUE ("remoteId"), CONSTRAINT "PK_3087346c2669c8b2d6941c65407" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_40182fd68f98d3a927e901d31a" ON "scrapper_metadata" ("kind") `);
    await queryRunner.query(`CREATE INDEX "IDX_87b3bf4ce535646aeea14a1f72" ON "scrapper_metadata" ("status") `);
    await queryRunner.query(`CREATE TABLE "book_review" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "nick" text NOT NULL, "description" text NOT NULL, "rating" smallint NOT NULL, "bookId" integer, "scrapperMetadataId" integer, "remoteId" integer, CONSTRAINT "REL_ac1c02339c7d1a3a1f4037ee6c" UNIQUE ("scrapperMetadataId"), CONSTRAINT "REL_7bf970df43e800a9e87ac39f42" UNIQUE ("remoteId"), CONSTRAINT "PK_ea377383a8a131c7c839aa0c21b" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_category" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "PK_0bfe418ce140d4720d0eede7c3e" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TYPE "book_reviewer_gender_enum" AS ENUM('1', '2', '3')`);
    await queryRunner.query(`CREATE TABLE "book_reviewer" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "gender" "book_reviewer_gender_enum" NOT NULL DEFAULT '1', "remoteId" integer NOT NULL, CONSTRAINT "REL_767582b2b44d87666925d57e96" UNIQUE ("remoteId"), CONSTRAINT "PK_dec58e392c148e4368ad6ca477d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "title" text NOT NULL, "isbn" text NOT NULL, "description" text NOT NULL, CONSTRAINT "PK_a3afef72ec8f80e6e5c310b28a4" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bd183604b9c828c0bdd92cafab" ON "book" ("isbn") `);
    await queryRunner.query(`CREATE TABLE "author" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, CONSTRAINT "PK_5a0e79799d372fe56f2f3fa6871" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_authors_author" ("bookId" integer NOT NULL, "authorId" integer NOT NULL, CONSTRAINT "PK_963de00068693ab6e5767de614b" PRIMARY KEY ("bookId", "authorId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_9bf58ffb2a12a8609a738ee8ca" ON "book_authors_author" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_a4cafdf2ec9974524a5321c751" ON "book_authors_author" ("authorId") `);
    await queryRunner.query(`CREATE TABLE "book_categories_book_category" ("bookId" integer NOT NULL, "bookCategoryId" integer NOT NULL, CONSTRAINT "PK_8362e0b8c34f6964937d3c7628d" PRIMARY KEY ("bookId", "bookCategoryId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_fbc3a8e562496effc06483995b" ON "book_categories_book_category" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_be9f819dcffa84d698aca662a5" ON "book_categories_book_category" ("bookCategoryId") `);
    await queryRunner.query(`CREATE TABLE "book_reviewers_book_reviewer" ("bookId" integer NOT NULL, "bookReviewerId" integer NOT NULL, CONSTRAINT "PK_7313fe2a7eca3678b385b7aba02" PRIMARY KEY ("bookId", "bookReviewerId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_50fb1b03bdc245a97ef30e767c" ON "book_reviewers_book_reviewer" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_674cfbba950aa16d2d1f375920" ON "book_reviewers_book_reviewer" ("bookReviewerId") `);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ADD CONSTRAINT "FK_4ba8d463c9321943789679b9d0a" FOREIGN KEY ("websiteId") REFERENCES "scrapper_website"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD CONSTRAINT "FK_4fab34ecec1e5c9eef22e75c1ea" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_d47a02807234f545466e113ca0b" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_ac1c02339c7d1a3a1f4037ee6c8" FOREIGN KEY ("scrapperMetadataId") REFERENCES "scrapper_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_7bf970df43e800a9e87ac39f420" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "FK_767582b2b44d87666925d57e96e" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_authors_author" ADD CONSTRAINT "FK_9bf58ffb2a12a8609a738ee8cae" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_authors_author" ADD CONSTRAINT "FK_a4cafdf2ec9974524a5321c7516" FOREIGN KEY ("authorId") REFERENCES "author"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_categories_book_category" ADD CONSTRAINT "FK_fbc3a8e562496effc06483995bb" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_categories_book_category" ADD CONSTRAINT "FK_be9f819dcffa84d698aca662a53" FOREIGN KEY ("bookCategoryId") REFERENCES "book_category"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_reviewers_book_reviewer" ADD CONSTRAINT "FK_50fb1b03bdc245a97ef30e767c0" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_reviewers_book_reviewer" ADD CONSTRAINT "FK_674cfbba950aa16d2d1f3759201" FOREIGN KEY ("bookReviewerId") REFERENCES "book_reviewer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewers_book_reviewer" DROP CONSTRAINT "FK_674cfbba950aa16d2d1f3759201"`);
    await queryRunner.query(`ALTER TABLE "book_reviewers_book_reviewer" DROP CONSTRAINT "FK_50fb1b03bdc245a97ef30e767c0"`);
    await queryRunner.query(`ALTER TABLE "book_categories_book_category" DROP CONSTRAINT "FK_be9f819dcffa84d698aca662a53"`);
    await queryRunner.query(`ALTER TABLE "book_categories_book_category" DROP CONSTRAINT "FK_fbc3a8e562496effc06483995bb"`);
    await queryRunner.query(`ALTER TABLE "book_authors_author" DROP CONSTRAINT "FK_a4cafdf2ec9974524a5321c7516"`);
    await queryRunner.query(`ALTER TABLE "book_authors_author" DROP CONSTRAINT "FK_9bf58ffb2a12a8609a738ee8cae"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "FK_767582b2b44d87666925d57e96e"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_7bf970df43e800a9e87ac39f420"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_ac1c02339c7d1a3a1f4037ee6c8"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_d47a02807234f545466e113ca0b"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP CONSTRAINT "FK_4fab34ecec1e5c9eef22e75c1ea"`);
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" DROP CONSTRAINT "FK_4ba8d463c9321943789679b9d0a"`);
    await queryRunner.query(`DROP INDEX "IDX_674cfbba950aa16d2d1f375920"`);
    await queryRunner.query(`DROP INDEX "IDX_50fb1b03bdc245a97ef30e767c"`);
    await queryRunner.query(`DROP TABLE "book_reviewers_book_reviewer"`);
    await queryRunner.query(`DROP INDEX "IDX_be9f819dcffa84d698aca662a5"`);
    await queryRunner.query(`DROP INDEX "IDX_fbc3a8e562496effc06483995b"`);
    await queryRunner.query(`DROP TABLE "book_categories_book_category"`);
    await queryRunner.query(`DROP INDEX "IDX_a4cafdf2ec9974524a5321c751"`);
    await queryRunner.query(`DROP INDEX "IDX_9bf58ffb2a12a8609a738ee8ca"`);
    await queryRunner.query(`DROP TABLE "book_authors_author"`);
    await queryRunner.query(`DROP TABLE "author"`);
    await queryRunner.query(`DROP INDEX "IDX_bd183604b9c828c0bdd92cafab"`);
    await queryRunner.query(`DROP TABLE "book"`);
    await queryRunner.query(`DROP TABLE "book_reviewer"`);
    await queryRunner.query(`DROP TYPE "book_reviewer_gender_enum"`);
    await queryRunner.query(`DROP TABLE "book_category"`);
    await queryRunner.query(`DROP TABLE "book_review"`);
    await queryRunner.query(`DROP INDEX "IDX_87b3bf4ce535646aeea14a1f72"`);
    await queryRunner.query(`DROP INDEX "IDX_40182fd68f98d3a927e901d31a"`);
    await queryRunner.query(`DROP TABLE "scrapper_metadata"`);
    await queryRunner.query(`DROP TYPE "scrapper_metadata_status_enum"`);
    await queryRunner.query(`DROP TYPE "scrapper_metadata_kind_enum"`);
    await queryRunner.query(`DROP TABLE "scrapper_remote_record"`);
    await queryRunner.query(`DROP INDEX "IDX_122f25c4152cd96d53c87dc0bb"`);
    await queryRunner.query(`DROP TABLE "scrapper_website"`);
  }
}
