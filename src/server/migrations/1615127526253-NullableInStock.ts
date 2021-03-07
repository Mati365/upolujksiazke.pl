/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class NullableInStock1615127526253 implements MigrationInterface {
  name = 'NullableInStock1615127526253';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "inStock" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_availability"."inStock" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "book_availability"."inStock" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_availability" ALTER COLUMN "inStock" SET NOT NULL`);
  }
}
