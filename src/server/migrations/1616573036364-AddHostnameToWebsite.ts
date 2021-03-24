/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddHostnameToWebsite1616573036364 implements MigrationInterface {
  name = 'AddHostnameToWebsite1616573036364';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_website" ADD "hostname" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_website" DROP COLUMN "hostname"`);
  }
}
