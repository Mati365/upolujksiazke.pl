/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddUniqueToViewsAggs1621614704056 implements MigrationInterface {
  name = 'AddUniqueToViewsAggs1621614704056';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "views_agg" ADD "recordId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "views_agg" ADD CONSTRAINT "views_aggs_unique_type_record" UNIQUE ("type", "recordId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "views_agg" DROP CONSTRAINT "views_aggs_unique_type_record"`);
    await queryRunner.query(`ALTER TABLE "views_agg" DROP COLUMN "recordId"`);
  }
}
