/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddMissingCheck1614245415338 implements MigrationInterface {
  name = 'AddMissingCheck1614245415338';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "description" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."description" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "CHK_425d6b700c1befc7ed942964b3" CHECK ("description" <> null OR "rating" <> null)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "CHK_425d6b700c1befc7ed942964b3"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_review"."description" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_review" ALTER COLUMN "description" SET NOT NULL`);
  }
}
