/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddParameterizedTitlesToPublisherAndAuthor1611920482179 implements MigrationInterface {
  name = 'AddParameterizedTitlesToPublisherAndAuthor1611920482179';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_author" ADD "parameterizedName" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_author" ADD CONSTRAINT "UQ_307d43b5c0acbd8c5787ac11e0a" UNIQUE ("parameterizedName")`);
    await queryRunner.query(`ALTER TABLE "book_publisher" ADD "parameterizedName" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_publisher" ADD CONSTRAINT "UQ_c78f7a63cbfc3be6ac3014ee6fc" UNIQUE ("parameterizedName")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_author"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_author" DROP CONSTRAINT "UQ_b62b34248c72f89fb6d27895e03"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_publisher"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_publisher" DROP CONSTRAINT "UQ_cd55e265ba094499c1c5c1ab69f"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_publisher" ADD CONSTRAINT "UQ_cd55e265ba094499c1c5c1ab69f" UNIQUE ("name")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_publisher"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_author" ADD CONSTRAINT "UQ_b62b34248c72f89fb6d27895e03" UNIQUE ("name")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_author"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_publisher" DROP CONSTRAINT "UQ_c78f7a63cbfc3be6ac3014ee6fc"`);
    await queryRunner.query(`ALTER TABLE "book_publisher" DROP COLUMN "parameterizedName"`);
    await queryRunner.query(`ALTER TABLE "book_author" DROP CONSTRAINT "UQ_307d43b5c0acbd8c5787ac11e0a"`);
    await queryRunner.query(`ALTER TABLE "book_author" DROP COLUMN "parameterizedName"`);
  }
}
