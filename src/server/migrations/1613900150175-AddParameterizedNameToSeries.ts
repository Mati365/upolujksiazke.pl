/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddParameterizedNameToSeries1613900150175 implements MigrationInterface {
  name = 'AddParameterizedNameToSeries1613900150175';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_series" ADD "parameterizedName" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_series" ADD CONSTRAINT "UQ_aa20a2732953492b700d0701d04" UNIQUE ("parameterizedName")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_series"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_series" DROP CONSTRAINT "UQ_6efaff7d0dcb0f65af4e4ef18a3"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_series" ADD CONSTRAINT "UQ_6efaff7d0dcb0f65af4e4ef18a3" UNIQUE ("name")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_series"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_series" DROP CONSTRAINT "UQ_aa20a2732953492b700d0701d04"`);
    await queryRunner.query(`ALTER TABLE "book_series" DROP COLUMN "parameterizedName"`);
  }
}
