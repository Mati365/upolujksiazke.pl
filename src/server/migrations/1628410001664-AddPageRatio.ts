/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddPageRatio1628410001664 implements MigrationInterface {
  name = 'AddPageRatio1628410001664';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."brochure_page" ADD "ratio" double precision NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."brochure_page" DROP COLUMN "ratio"`);
  }
}
