/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddRelationsToBookAvailability1610542235632 implements MigrationInterface {
  name = 'AddRelationsToBookAvailability1610542235632';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "avgRating" smallint`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "totalRatings" integer NOT NULL DEFAULT '0'`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "bookId" integer`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD "volumeId" integer`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_796741305dbe12b74e67cff3812" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_c161f62f5d0854088376f95b923" FOREIGN KEY ("volumeId") REFERENCES "book_volume"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_c161f62f5d0854088376f95b923"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_796741305dbe12b74e67cff3812"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "volumeId"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "bookId"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "totalRatings"`);
    await queryRunner.query(`ALTER TABLE "book_availability" DROP COLUMN "avgRating"`);
  }
}
