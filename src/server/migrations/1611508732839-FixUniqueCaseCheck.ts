/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class FixUniqueCaseCheck1611508732839 implements MigrationInterface {
  name = 'FixUniqueCaseCheck1611508732839';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_publisher" DROP CONSTRAINT "UQ_cd55e265ba094499c1c5c1ab69f"`);
    await queryRunner.query(`ALTER TABLE "book_publisher" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "book_publisher" ADD "name" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_publisher" ADD CONSTRAINT "UQ_cd55e265ba094499c1c5c1ab69f" UNIQUE ("name")`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "UQ_b8534c4c9767a5f43697942f0ce"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "isbn"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "isbn" citext NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "UQ_b8534c4c9767a5f43697942f0ce" UNIQUE ("isbn")`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_27284d0af86f3f4f913194fe37d"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalTitle"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalTitle" citext`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_27284d0af86f3f4f913194fe37d" UNIQUE ("originalTitle")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_27284d0af86f3f4f913194fe37d"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalTitle"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalTitle" text`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_27284d0af86f3f4f913194fe37d" UNIQUE ("originalTitle")`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "UQ_b8534c4c9767a5f43697942f0ce"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "isbn"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "isbn" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "UQ_b8534c4c9767a5f43697942f0ce" UNIQUE ("isbn")`);
    await queryRunner.query(`ALTER TABLE "book_publisher" DROP CONSTRAINT "UQ_cd55e265ba094499c1c5c1ab69f"`);
    await queryRunner.query(`ALTER TABLE "book_publisher" DROP COLUMN "name"`);
    await queryRunner.query(`ALTER TABLE "book_publisher" ADD "name" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_publisher" ADD CONSTRAINT "UQ_cd55e265ba094499c1c5c1ab69f" UNIQUE ("name")`);
  }
}
