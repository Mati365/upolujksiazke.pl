/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAllTypesToBook1615715211451 implements MigrationInterface {
  name = 'AddAllTypesToBook1615715211451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "book_alltypes_enum" AS ENUM('1', '2', '3')`);
    await queryRunner.query(`ALTER TABLE "book" ADD "allTypes" "book_alltypes_enum" array NOT NULL DEFAULT '{}'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "allTypes"`);
    await queryRunner.query(`DROP TYPE "book_alltypes_enum"`);
  }
}
