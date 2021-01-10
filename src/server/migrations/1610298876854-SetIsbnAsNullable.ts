/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class SetIsbnAsNullable1610298876854 implements MigrationInterface {
  name = 'SetIsbnAsNullable1610298876854';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "unique_publisher_isbn"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "UQ_e759af7122e3796b4e4ca8a23b4"`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "isbn" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."isbn" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "unique_publisher_edition" UNIQUE ("title", "publisherId", "edition")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "unique_publisher_edition"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."isbn" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "isbn" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "UQ_e759af7122e3796b4e4ca8a23b4" UNIQUE ("title")`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "unique_publisher_isbn" UNIQUE ("isbn", "publisherId")`);
  }
}
