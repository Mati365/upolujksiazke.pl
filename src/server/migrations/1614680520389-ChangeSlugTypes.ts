/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class ChangeSlugTypes1614680520389 implements MigrationInterface {
  name = 'ChangeSlugTypes1614680520389';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "parameterizedSlug"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "parameterizedSlug" text`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_7687b452c719817624d4a2f1668"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "parameterizedSlug"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "parameterizedSlug" text`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_7687b452c719817624d4a2f1668" UNIQUE ("parameterizedSlug")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_7687b452c719817624d4a2f1668"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "parameterizedSlug"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "parameterizedSlug" citext`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_7687b452c719817624d4a2f1668" UNIQUE ("parameterizedSlug")`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "parameterizedSlug"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "parameterizedSlug" citext`);
  }
}
