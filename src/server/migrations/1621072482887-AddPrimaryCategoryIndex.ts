/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddPrimaryCategoryIndex1621072482887 implements MigrationInterface {
  name = 'AddPrimaryCategoryIndex1621072482887';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_3dd766f7b2a504ff657fbdf62b" ON "book" ("primaryCategoryId") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_3dd766f7b2a504ff657fbdf62b"`);
  }
}
