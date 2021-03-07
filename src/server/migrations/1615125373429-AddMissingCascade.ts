/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddMissingCascade1615125373429 implements MigrationInterface {
  name = 'AddMissingCascade1615125373429';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_2a61a927bdac80dfa4b44f6e2ec"`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_2a61a927bdac80dfa4b44f6e2ec" FOREIGN KEY ("primaryReleaseId") REFERENCES "book_release"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_2a61a927bdac80dfa4b44f6e2ec"`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_2a61a927bdac80dfa4b44f6e2ec" FOREIGN KEY ("primaryReleaseId") REFERENCES "book_release"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
