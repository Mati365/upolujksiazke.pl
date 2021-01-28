/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddParentReleaseToRelease1611845614299 implements MigrationInterface {
  name = 'AddParentReleaseToRelease1611845614299';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" ADD "parentReleaseId" integer`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "title" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_a174a010b74160cb803d2235fe8" FOREIGN KEY ("parentReleaseId") REFERENCES "book_release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_a174a010b74160cb803d2235fe8"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "title" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "parentReleaseId"`);
  }
}
