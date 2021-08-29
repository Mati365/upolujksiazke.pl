/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddParameterizedNamesToRecords1612001992476 implements MigrationInterface {
  name = 'AddParameterizedNamesToRecords1612001992476';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_category" ADD "parameterizedName" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD CONSTRAINT "UQ_cc7364aed9da3ab8fb31b1e2f88" UNIQUE ("parameterizedName")`);
    await queryRunner.query(`ALTER TABLE "book_prize" ADD "parameterizedName" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_prize" ADD CONSTRAINT "UQ_4758e11ad8ddb4f211dad8bf2d4" UNIQUE ("parameterizedName")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_category"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP CONSTRAINT "UQ_e5c2172676f335ef6a0e6335a7e"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_prize"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_prize" DROP CONSTRAINT "UQ_999f174cba0e74d866020567bb3"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_prize" ADD CONSTRAINT "UQ_999f174cba0e74d866020567bb3" UNIQUE ("name")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_prize"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD CONSTRAINT "UQ_e5c2172676f335ef6a0e6335a7e" UNIQUE ("name")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_category"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_prize" DROP CONSTRAINT "UQ_4758e11ad8ddb4f211dad8bf2d4"`);
    await queryRunner.query(`ALTER TABLE "book_prize" DROP COLUMN "parameterizedName"`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP CONSTRAINT "UQ_cc7364aed9da3ab8fb31b1e2f88"`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP COLUMN "parameterizedName"`);
  }
}
