/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RemoteTitlesFromBookEntity1610288522276 implements MigrationInterface {
  name = 'RemoteTitlesFromBookEntity1610288522276';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_c10a44a29ef231062f22b1b7ac5"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "title"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "description" text`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "title" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "UQ_e759af7122e3796b4e4ca8a23b4" UNIQUE ("title")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "UQ_e759af7122e3796b4e4ca8a23b4"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "title" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "description"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "description" text`);
    await queryRunner.query(`ALTER TABLE "book" ADD "title" text NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_c10a44a29ef231062f22b1b7ac5" UNIQUE ("title")`);
  }
}
