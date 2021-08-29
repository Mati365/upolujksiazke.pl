/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddDescriptionToBook1616845397586 implements MigrationInterface {
  name = 'AddDescriptionToBook1616845397586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "description" text`);
    await queryRunner.query(`ALTER TABLE "book" ADD "taggedDescription" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "taggedDescription"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "description"`);
  }
}
