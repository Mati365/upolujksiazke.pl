/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBookBinding1609852372608 implements MigrationInterface {
  name = 'AddBookBinding1609852372608';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "book_release_binding_enum" AS ENUM('1', '2', '3', '4')`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "binding" "book_release_binding_enum"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "binding"`);
    await queryRunner.query(`DROP TYPE "book_release_binding_enum"`);
  }
}
