/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddProcessedAt1612522612820 implements MigrationInterface {
  name = 'AddProcessedAt1612522612820';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" ADD "processedAt" TIMESTAMP DEFAULT null`);
    await queryRunner.query(`ALTER TYPE "public"."book_release_type_enum" RENAME TO "book_release_type_enum_old"`);
    await queryRunner.query(`CREATE TYPE "book_release_type_enum" AS ENUM('1', '2', '3')`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "type" TYPE "book_release_type_enum" USING "type"::"text"::"book_release_type_enum"`);
    await queryRunner.query(`DROP TYPE "book_release_type_enum_old"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."type" IS NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."type" IS NULL`);
    await queryRunner.query(`CREATE TYPE "book_release_type_enum_old" AS ENUM('1', '2')`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "type" TYPE "book_release_type_enum_old" USING "type"::"text"::"book_release_type_enum_old"`);
    await queryRunner.query(`DROP TYPE "book_release_type_enum"`);
    await queryRunner.query(`ALTER TYPE "book_release_type_enum_old" RENAME TO  "book_release_type_enum"`);
    await queryRunner.query(`ALTER TABLE "scrapper_metadata" DROP COLUMN "processedAt"`);
  }
}
