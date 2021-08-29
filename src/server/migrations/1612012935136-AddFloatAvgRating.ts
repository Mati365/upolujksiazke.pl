/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddFloatAvgRating1612012935136 implements MigrationInterface {
  name = 'AddFloatAvgRating1612012935136';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "avgRating"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "avgRating" double precision`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "avgRating"`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "avgRating" smallint`);
  }
}
