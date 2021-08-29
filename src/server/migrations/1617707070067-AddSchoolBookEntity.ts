/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddSchoolBookEntity1617707070067 implements MigrationInterface {
  name = 'AddSchoolBookEntity1617707070067';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "school_book_classlevel_enum" AS ENUM('1', '2', '3', '4', '5')`);
    await queryRunner.query(`CREATE TABLE "school_book" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "classLevel" "school_book_classlevel_enum", "obligatory" boolean, CONSTRAINT "PK_2c9100cb492a23a7ca9ced7ad3d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "book" ADD "schoolBookId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_2895231e84967e2540259bdef2e" UNIQUE ("schoolBookId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_2895231e84967e2540259bdef2e" FOREIGN KEY ("schoolBookId") REFERENCES "school_book"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_2895231e84967e2540259bdef2e"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_2895231e84967e2540259bdef2e"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "schoolBookId"`);
    await queryRunner.query(`DROP TABLE "school_book"`);
    await queryRunner.query(`DROP TYPE "school_book_classlevel_enum"`);
  }
}
