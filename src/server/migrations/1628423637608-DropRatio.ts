/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class DropRatio1628423637608 implements MigrationInterface {
  name = 'DropRatio1628423637608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."brochure_page" DROP COLUMN "ratio"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."brochure_page" ADD "ratio" double precision NOT NULL`);
  }
}
