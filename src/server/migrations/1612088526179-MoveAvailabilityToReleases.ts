/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class MoveAvailabilityToReleases1612088526179 implements MigrationInterface {
  name = 'MoveAvailabilityToReleases1612088526179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "releaseId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_796741305dbe12b74e67cff3812"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_book_website"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "bookId" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_availability"."bookId" IS NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_a8ff4b1752dbd88a62659c6d9c" ON "book_availability" ("bookId", "releaseId") `);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_book_website" UNIQUE ("bookId", "websiteId", "releaseId")`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_796741305dbe12b74e67cff3812" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_1df23b87bef5110e1fbe8b3dc20" FOREIGN KEY ("releaseId") REFERENCES "book_release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_1df23b87bef5110e1fbe8b3dc20"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_796741305dbe12b74e67cff3812"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_book_website"`);
    await queryRunner.query(`DROP INDEX "IDX_a8ff4b1752dbd88a62659c6d9c"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_availability"."bookId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "bookId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_book_website" UNIQUE ("bookId", "websiteId")`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_796741305dbe12b74e67cff3812" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "releaseId"`);
  }
}
