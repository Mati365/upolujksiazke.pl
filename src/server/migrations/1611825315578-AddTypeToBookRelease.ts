/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddTypeToBookRelease1611825315578 implements MigrationInterface {
  name = 'AddTypeToBookRelease1611825315578';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "book_release_type_enum" AS ENUM('1', '2')`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "type" "book_release_type_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "book_release_type_enum"`);
  }
}
