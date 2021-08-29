/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddUniqueToBrochurePage1627828674914 implements MigrationInterface {
  name = 'AddUniqueToBrochurePage1627828674914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."brochure_page" ADD CONSTRAINT "unique_page_index" UNIQUE ("brochureId", "index")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."brochure_page" DROP CONSTRAINT "unique_page_index"`);
  }
}
