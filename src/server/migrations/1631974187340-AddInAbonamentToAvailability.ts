/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddInAbonamentToAvailability1631974187340 implements MigrationInterface {
  name = 'AddInAbonamentToAvailability1631974187340';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."book_availability" ADD "inAbonament" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."book_availability" DROP COLUMN "inAbonament"`);
  }
}
