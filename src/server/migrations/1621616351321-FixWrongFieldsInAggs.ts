/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixWrongFieldsInAggs1621616351321 implements MigrationInterface {
  name = 'FixWrongFieldsInAggs1621616351321';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_909fce7c8b5272f4d587a69932"`);
    await queryRunner.query(`CREATE TYPE "views_agg_mode_enum" AS ENUM('1', '2')`);
    await queryRunner.query(`ALTER TABLE "views_agg" ADD "mode" "views_agg_mode_enum" NOT NULL`);
    await queryRunner.query(`CREATE INDEX "IDX_ebcda6819068856473246e04fe" ON "views_agg" ("mode") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_ebcda6819068856473246e04fe"`);
    await queryRunner.query(`ALTER TABLE "views_agg" DROP COLUMN "mode"`);
    await queryRunner.query(`DROP TYPE "views_agg_mode_enum"`);
    await queryRunner.query(`CREATE INDEX "IDX_909fce7c8b5272f4d587a69932" ON "views_agg" ("type") `);
  }
}
