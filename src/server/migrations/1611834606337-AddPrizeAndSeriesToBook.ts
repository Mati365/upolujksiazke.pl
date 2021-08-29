/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddPrizeAndSeriesToBook1611834606337 implements MigrationInterface {
  name = 'AddPrizeAndSeriesToBook1611834606337';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_c26c36fe0f31695f20716ac5e90"`);
    await queryRunner.query(`ALTER TABLE "book_volume" DROP CONSTRAINT "FK_53231db1ba83c2c270dc8f54af0"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_c161f62f5d0854088376f95b923"`);
    await queryRunner.query(`DROP INDEX "IDX_c26c36fe0f31695f20716ac5e9"`);
    await queryRunner.query(`DROP INDEX "IDX_53231db1ba83c2c270dc8f54af"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_book_volume_website"`);
    await queryRunner.query(`CREATE TABLE "book_series" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" citext NOT NULL, "publisherId" integer NOT NULL, CONSTRAINT "UQ_6efaff7d0dcb0f65af4e4ef18a3" UNIQUE ("name"), CONSTRAINT "PK_c6c5a77e8b605c605fadbcaec39" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_prize" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" citext NOT NULL, "wikiUrl" text, CONSTRAINT "UQ_999f174cba0e74d866020567bb3" UNIQUE ("name"), CONSTRAINT "PK_8fc4b58a51a7fcf81a98ddcd1f6" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_kind" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" citext NOT NULL, CONSTRAINT "UQ_e6b2774660c3671d86a977d094e" UNIQUE ("name"), CONSTRAINT "PK_38ef2a23cbaae9c486ab4af3aa3" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_series_book_series" ("bookId" integer NOT NULL, "bookSeriesId" integer NOT NULL, CONSTRAINT "PK_c61ecebd981373e9a88f31b0bf6" PRIMARY KEY ("bookId", "bookSeriesId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_e3600246780c0bbf03da9e9487" ON "book_series_book_series" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_f4e2fc6f902c88580ed73abba3" ON "book_series_book_series" ("bookSeriesId") `);
    await queryRunner.query(`CREATE TABLE "book_prizes_book_prize" ("bookId" integer NOT NULL, "bookPrizeId" integer NOT NULL, CONSTRAINT "PK_e3d7b5fdb4811e8e0852ae8685d" PRIMARY KEY ("bookId", "bookPrizeId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_97eac7418a8bcf600415a8e6ab" ON "book_prizes_book_prize" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_a7ffca9d4968ad608d374fb018" ON "book_prizes_book_prize" ("bookPrizeId") `);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "volumeId"`);
    await queryRunner.query(`ALTER TABLE "book_volume" DROP COLUMN "bookId"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "volumeId"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "volumeId" integer`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_book_website" UNIQUE ("bookId", "websiteId")`);
    await queryRunner.query(`ALTER TABLE "book_series" ADD CONSTRAINT "FK_3e53483e197911fbc961b9771d2" FOREIGN KEY ("publisherId") REFERENCES "book_publisher"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_b5cc5092fb00c760808de56d9bb" FOREIGN KEY ("volumeId") REFERENCES "book_volume"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_series_book_series" ADD CONSTRAINT "FK_e3600246780c0bbf03da9e94875" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_series_book_series" ADD CONSTRAINT "FK_f4e2fc6f902c88580ed73abba32" FOREIGN KEY ("bookSeriesId") REFERENCES "book_series"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_prizes_book_prize" ADD CONSTRAINT "FK_97eac7418a8bcf600415a8e6ab3" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_prizes_book_prize" ADD CONSTRAINT "FK_a7ffca9d4968ad608d374fb0189" FOREIGN KEY ("bookPrizeId") REFERENCES "book_prize"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_prizes_book_prize" DROP CONSTRAINT "FK_a7ffca9d4968ad608d374fb0189"`);
    await queryRunner.query(`ALTER TABLE "book_prizes_book_prize" DROP CONSTRAINT "FK_97eac7418a8bcf600415a8e6ab3"`);
    await queryRunner.query(`ALTER TABLE "book_series_book_series" DROP CONSTRAINT "FK_f4e2fc6f902c88580ed73abba32"`);
    await queryRunner.query(`ALTER TABLE "book_series_book_series" DROP CONSTRAINT "FK_e3600246780c0bbf03da9e94875"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_b5cc5092fb00c760808de56d9bb"`);
    await queryRunner.query(`ALTER TABLE "book_series" DROP CONSTRAINT "FK_3e53483e197911fbc961b9771d2"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_book_website"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "volumeId"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "volumeId" integer`);
    await queryRunner.query(`ALTER TABLE "book_volume" ADD "bookId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "volumeId" integer`);
    await queryRunner.query(`DROP INDEX "IDX_a7ffca9d4968ad608d374fb018"`);
    await queryRunner.query(`DROP INDEX "IDX_97eac7418a8bcf600415a8e6ab"`);
    await queryRunner.query(`DROP TABLE "book_prizes_book_prize"`);
    await queryRunner.query(`DROP INDEX "IDX_f4e2fc6f902c88580ed73abba3"`);
    await queryRunner.query(`DROP INDEX "IDX_e3600246780c0bbf03da9e9487"`);
    await queryRunner.query(`DROP TABLE "book_series_book_series"`);
    await queryRunner.query(`DROP TABLE "book_kind"`);
    await queryRunner.query(`DROP TABLE "book_prize"`);
    await queryRunner.query(`DROP TABLE "book_series"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_book_volume_website" UNIQUE ("bookId", "volumeId", "websiteId")`);
    await queryRunner.query(`CREATE INDEX "IDX_53231db1ba83c2c270dc8f54af" ON "book_volume" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_c26c36fe0f31695f20716ac5e9" ON "book_release" ("volumeId") `);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_c161f62f5d0854088376f95b923" FOREIGN KEY ("volumeId") REFERENCES "book_volume"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_volume" ADD CONSTRAINT "FK_53231db1ba83c2c270dc8f54af0" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_c26c36fe0f31695f20716ac5e90" FOREIGN KEY ("volumeId") REFERENCES "book_volume"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
