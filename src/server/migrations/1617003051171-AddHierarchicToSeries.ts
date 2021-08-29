/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddHierarchicToSeries1617003051171 implements MigrationInterface {
  name = 'AddHierarchicToSeries1617003051171';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_series" ADD "hierarchic" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_series" DROP COLUMN "hierarchic"`);
  }
}
