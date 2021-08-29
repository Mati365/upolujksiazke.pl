/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddMissingIndexToAggs1621614879194 implements MigrationInterface {
  name = 'AddMissingIndexToAggs1621614879194';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_01c3f60425506b32c47eabe2d8" ON "views_agg" ("type", "recordId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_01c3f60425506b32c47eabe2d8"`);
  }
}
