/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class DropBloggerFlag1624604774026 implements MigrationInterface {
  name = 'DropBloggerFlag1624604774026';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_dcaaf3cccce765dfb4fb75e5a1"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "blogger"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ADD "blogger" boolean DEFAULT false`);
    await queryRunner.query(`CREATE INDEX "IDX_dcaaf3cccce765dfb4fb75e5a1" ON "book_review" ("bookId", "blogger") `);
  }
}
