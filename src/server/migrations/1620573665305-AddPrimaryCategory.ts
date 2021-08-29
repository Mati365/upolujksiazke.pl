/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddPrimaryCategory1620573665305 implements MigrationInterface {
  name = 'AddPrimaryCategory1620573665305';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "primaryCategoryId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_3dd766f7b2a504ff657fbdf62bf" FOREIGN KEY ("primaryCategoryId") REFERENCES "book_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_3dd766f7b2a504ff657fbdf62bf"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "primaryCategoryId"`);
  }
}
