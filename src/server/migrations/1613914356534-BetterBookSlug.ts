/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class BetterBookSlug1613914356534 implements MigrationInterface {
  name = 'BetterBookSlug1613914356534';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_87ab6431ed65fceed9c950e9046"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "parameterizedTitle"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "parameterizedSlug" citext`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_7687b452c719817624d4a2f1668" UNIQUE ("parameterizedSlug")`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."originalTitle" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_27284d0af86f3f4f913194fe37d"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_27284d0af86f3f4f913194fe37d" UNIQUE ("originalTitle")`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."originalTitle" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_7687b452c719817624d4a2f1668"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "parameterizedSlug"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "parameterizedTitle" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_87ab6431ed65fceed9c950e9046" UNIQUE ("parameterizedTitle")`);
  }
}
