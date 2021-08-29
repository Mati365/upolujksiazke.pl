/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBookReleaseDeleteCascade1610287231999 implements MigrationInterface {
  name = 'AddBookReleaseDeleteCascade1610287231999';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_0cbd0caed48b7acdd31f56bdc7a"`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "bookId" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."bookId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_0cbd0caed48b7acdd31f56bdc7a" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_0cbd0caed48b7acdd31f56bdc7a"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."bookId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "bookId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_0cbd0caed48b7acdd31f56bdc7a" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
