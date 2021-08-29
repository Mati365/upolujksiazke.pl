/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddIncludeInStatsField1615462981112 implements MigrationInterface {
  name = 'AddIncludeInStatsField1615462981112';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ADD "includeInStats" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "includeInStats"`);
  }
}
