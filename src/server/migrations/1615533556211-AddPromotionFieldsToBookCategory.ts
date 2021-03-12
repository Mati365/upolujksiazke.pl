/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddPromotionFieldsToBookCategory1615533556211 implements MigrationInterface {
  name = 'AddPromotionFieldsToBookCategory1615533556211';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_category" ADD "promotion" integer`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD "promotionLock" boolean DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD "parentCategoryId" integer`);
    await queryRunner.query(`CREATE INDEX "IDX_46c46f26fa396b3b73ec727e50" ON "book_category" ("parentCategoryId") `);
    await queryRunner.query(`ALTER TABLE "book_category" ADD CONSTRAINT "FK_46c46f26fa396b3b73ec727e50d" FOREIGN KEY ("parentCategoryId") REFERENCES "book_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_category" DROP CONSTRAINT "FK_46c46f26fa396b3b73ec727e50d"`);
    await queryRunner.query(`DROP INDEX "IDX_46c46f26fa396b3b73ec727e50"`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP COLUMN "parentCategoryId"`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP COLUMN "promotionLock"`);
    await queryRunner.query(`ALTER TABLE "book_category" DROP COLUMN "promotion"`);
  }
}
