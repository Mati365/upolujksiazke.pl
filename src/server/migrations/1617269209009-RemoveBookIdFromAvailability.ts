/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class RemoveBookIdFromAvailability1617269209009 implements MigrationInterface {
  name = 'RemoveBookIdFromAvailability1617269209009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_796741305dbe12b74e67cff3812"`);
    await queryRunner.query(`DROP INDEX "IDX_796741305dbe12b74e67cff381"`);
    await queryRunner.query(`DROP INDEX "IDX_a8ff4b1752dbd88a62659c6d9c"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_book_remote_website"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "bookId"`);
    await queryRunner.query(`CREATE INDEX "IDX_1df23b87bef5110e1fbe8b3dc2" ON "book_availability" ("releaseId") `);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_remote_website" UNIQUE ("websiteId", "remoteId", "releaseId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "book_availability_unique_remote_website"`);
    await queryRunner.query(`DROP INDEX "IDX_1df23b87bef5110e1fbe8b3dc2"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "bookId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "book_availability_unique_book_remote_website" UNIQUE ("bookId", "websiteId", "remoteId", "releaseId")`);
    await queryRunner.query(`CREATE INDEX "IDX_a8ff4b1752dbd88a62659c6d9c" ON "book_availability" ("bookId", "releaseId") `);
    await queryRunner.query(`CREATE INDEX "IDX_796741305dbe12b74e67cff381" ON "book_availability" ("bookId") `);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_796741305dbe12b74e67cff3812" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
