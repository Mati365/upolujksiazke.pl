/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddSlugToRelease1614251952109 implements MigrationInterface {
  name = 'AddSlugToRelease1614251952109';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" ADD "parameterizedSlug" citext`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "parameterizedSlug"`);
  }
}
