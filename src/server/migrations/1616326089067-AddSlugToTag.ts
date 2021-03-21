/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddSlugToTag1616326089067 implements MigrationInterface {
  name = 'AddSlugToTag1616326089067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tag" ADD "parameterizedName" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "UQ_5e7a5cb67f069035f05860569c3" UNIQUE ("parameterizedName")`);
    await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tag" ADD CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "tag" DROP CONSTRAINT "UQ_5e7a5cb67f069035f05860569c3"`);
    await queryRunner.query(`ALTER TABLE "tag" DROP COLUMN "parameterizedName"`);
  }
}
