/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class DropOriginalReleaseRelation1610286170932 implements MigrationInterface {
  name = 'DropOriginalReleaseRelation1610286170932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_2ca9f209a95887580aa85a0dc68"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_2ca9f209a95887580aa85a0dc68"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalReleaseId"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalTitle" text`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_27284d0af86f3f4f913194fe37d" UNIQUE ("originalTitle")`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalPublishDate" text`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "unique_publisher_isbn"`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "isbn" SET NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."isbn" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "unique_publisher_isbn" UNIQUE ("isbn", "publisherId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "unique_publisher_isbn"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."isbn" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "isbn" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "unique_publisher_isbn" UNIQUE ("isbn", "publisherId")`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalPublishDate"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_27284d0af86f3f4f913194fe37d"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "originalTitle"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "originalReleaseId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_2ca9f209a95887580aa85a0dc68" UNIQUE ("originalReleaseId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_2ca9f209a95887580aa85a0dc68" FOREIGN KEY ("originalReleaseId") REFERENCES "book_release"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
