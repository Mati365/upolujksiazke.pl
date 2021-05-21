/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddDateToAggsUniq1621616843513 implements MigrationInterface {
  name = 'AddDateToAggsUniq1621616843513';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "views_agg" DROP CONSTRAINT "views_aggs_unique_type_record"`);
    await queryRunner.query(`ALTER TABLE "views_agg" ADD CONSTRAINT "views_aggs_dated_type_unique_record" UNIQUE ("type", "recordId", "date")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "views_agg" DROP CONSTRAINT "views_aggs_dated_type_unique_record"`);
    await queryRunner.query(`ALTER TABLE "views_agg" ADD CONSTRAINT "views_aggs_unique_type_record" UNIQUE ("type", "recordId")`);
  }
}
