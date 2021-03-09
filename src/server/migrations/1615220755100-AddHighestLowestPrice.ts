/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddHighestLowestPrice1615220755100 implements MigrationInterface {
  name = 'AddHighestLowestPrice1615220755100';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "lowestPrice" numeric(5,2)`);
    await queryRunner.query(`ALTER TABLE "book" ADD "highestPrice" numeric(5,2)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "highestPrice"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "lowestPrice"`);
  }
}
