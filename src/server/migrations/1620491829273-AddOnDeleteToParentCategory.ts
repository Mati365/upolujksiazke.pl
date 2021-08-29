/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddOnDeleteToParentCategory1620491829273 implements MigrationInterface {
  name = 'AddOnDeleteToParentCategory1620491829273';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_category" DROP CONSTRAINT "FK_46c46f26fa396b3b73ec727e50d"`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD CONSTRAINT "FK_46c46f26fa396b3b73ec727e50d" FOREIGN KEY ("parentCategoryId") REFERENCES "book_category"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_category" DROP CONSTRAINT "FK_46c46f26fa396b3b73ec727e50d"`);
    await queryRunner.query(`ALTER TABLE "book_category" ADD CONSTRAINT "FK_46c46f26fa396b3b73ec727e50d" FOREIGN KEY ("parentCategoryId") REFERENCES "book_category"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
