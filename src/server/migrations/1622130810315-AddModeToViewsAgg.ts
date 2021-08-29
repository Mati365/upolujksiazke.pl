/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddModeToViewsAgg1622130810315 implements MigrationInterface {
  name = 'AddModeToViewsAgg1622130810315';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_01c3f60425506b32c47eabe2d8"`);
    await queryRunner.query(`ALTER TABLE "views_agg" DROP CONSTRAINT "views_aggs_dated_type_unique_record"`);
    await queryRunner.query(`CREATE INDEX "IDX_c5062ca1d2fad7254c3f140e18" ON "views_agg" ("mode", "type", "recordId") `);
    await queryRunner.query(`ALTER TABLE "views_agg" ADD CONSTRAINT "views_aggs_mode_type_unique_record" UNIQUE ("mode", "type", "recordId", "date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "views_agg" DROP CONSTRAINT "views_aggs_mode_type_unique_record"`);
    await queryRunner.query(`DROP INDEX "IDX_c5062ca1d2fad7254c3f140e18"`);
    await queryRunner.query(`ALTER TABLE "views_agg" ADD CONSTRAINT "views_aggs_dated_type_unique_record" UNIQUE ("date", "type", "recordId")`);
    await queryRunner.query(`CREATE INDEX "IDX_01c3f60425506b32c47eabe2d8" ON "views_agg" ("type", "recordId") `);
  }
}
