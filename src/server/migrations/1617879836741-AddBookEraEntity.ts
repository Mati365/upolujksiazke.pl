/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBookEraEntity1617879836741 implements MigrationInterface {
  name = 'AddBookEraEntity1617879836741';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "book_era" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parameterizedName" text NOT NULL, "name" citext NOT NULL, CONSTRAINT "UQ_abc3070d67e6d26e3a9e6a6e0b2" UNIQUE ("parameterizedName"), CONSTRAINT "PK_93ab153886f5badfdcaea6c00d3" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_era_book_era" ("bookId" integer NOT NULL, "bookEraId" integer NOT NULL, CONSTRAINT "PK_f68377eb723f4d0a1fd9d51d3b9" PRIMARY KEY ("bookId", "bookEraId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_8ef5f2bb34074e029e10ad81e0" ON "book_era_book_era" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_544b709655550ff58588d2d0ec" ON "book_era_book_era" ("bookEraId") `);
    await queryRunner.query(`ALTER TABLE "book_era_book_era" ADD CONSTRAINT "FK_8ef5f2bb34074e029e10ad81e00" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_era_book_era" ADD CONSTRAINT "FK_544b709655550ff58588d2d0ec2" FOREIGN KEY ("bookEraId") REFERENCES "book_era"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_era_book_era" DROP CONSTRAINT "FK_544b709655550ff58588d2d0ec2"`);
    await queryRunner.query(`ALTER TABLE "book_era_book_era" DROP CONSTRAINT "FK_8ef5f2bb34074e029e10ad81e00"`);
    await queryRunner.query(`DROP INDEX "IDX_544b709655550ff58588d2d0ec"`);
    await queryRunner.query(`DROP INDEX "IDX_8ef5f2bb34074e029e10ad81e0"`);
    await queryRunner.query(`DROP TABLE "book_era_book_era"`);
    await queryRunner.query(`DROP TABLE "book_era"`);
  }
}
