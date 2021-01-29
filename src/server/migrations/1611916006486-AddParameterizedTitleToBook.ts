/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddParameterizedTitleToBook1611916006486 implements MigrationInterface {
  name = 'AddParameterizedTitleToBook1611916006486';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "parameterizedTitle" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_87ab6431ed65fceed9c950e9046" UNIQUE ("parameterizedTitle")`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."defaultTitle" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_3af9932cb0ff55d0324c211aedd"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_3af9932cb0ff55d0324c211aedd" UNIQUE ("defaultTitle")`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."defaultTitle" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_87ab6431ed65fceed9c950e9046"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "parameterizedTitle"`);
  }
}
