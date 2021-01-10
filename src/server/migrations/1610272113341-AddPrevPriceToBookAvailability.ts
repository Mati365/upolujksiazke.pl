/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddPrevPriceToBookAvailability1610272113341 implements MigrationInterface {
  name = 'AddPrevPriceToBookAvailability1610272113341';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "prevPrice" money`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "prevPrice"`);
  }
}
