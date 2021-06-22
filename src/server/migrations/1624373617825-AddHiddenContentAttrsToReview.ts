/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddHiddenContentAttrsToReview1624373617825 implements MigrationInterface {
  name = 'AddHiddenContentAttrsToReview1624373617825';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ADD "blogger" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "hiddenContent" boolean DEFAULT false`);
    await queryRunner.query(`CREATE INDEX "IDX_dcaaf3cccce765dfb4fb75e5a1" ON "book_review" ("bookId", "blogger") `);
    await queryRunner.query(`CREATE INDEX "IDX_9e5674c06c247b505ad6e7ac1b" ON "book_review" ("bookId", "hiddenContent") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_9e5674c06c247b505ad6e7ac1b"`);
    await queryRunner.query(`DROP INDEX "IDX_dcaaf3cccce765dfb4fb75e5a1"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "hiddenContent"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "blogger"`);
  }
}
