/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class ChangePriceTypes1611489896911 implements MigrationInterface {
  name = 'ChangePriceTypes1611489896911';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "prevPrice"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "prevPrice" numeric(5,2)`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "price" numeric(5,2)`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "defaultPrice"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "defaultPrice" numeric(5,2)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "defaultPrice"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "defaultPrice" money`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "price"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "price" money`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "prevPrice"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "prevPrice" money`);
  }
}
