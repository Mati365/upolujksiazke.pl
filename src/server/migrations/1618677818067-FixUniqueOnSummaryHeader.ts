/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixUniqueOnSummaryHeader1618677818067 implements MigrationInterface {
  name = 'FixUniqueOnSummaryHeader1618677818067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_summary_header" DROP CONSTRAINT "book_summary_header_unique_title_url"`);
    await queryRunner.query(`ALTER TABLE "book_summary_header" ADD CONSTRAINT "book_summary_header_unique_slug_url" UNIQUE ("parameterizedTitle", "url")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_summary_header" DROP CONSTRAINT "book_summary_header_unique_slug_url"`);
    await queryRunner.query(`ALTER TABLE "book_summary_header" ADD CONSTRAINT "book_summary_header_unique_title_url" UNIQUE ("title", "url")`);
  }
}
