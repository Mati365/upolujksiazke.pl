/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddUrlToRemoteEntity1609951477254 implements MigrationInterface {
  name = 'AddUrlToRemoteEntity1609951477254';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" ADD "url" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_remote_record" DROP COLUMN "url"`);
  }
}
