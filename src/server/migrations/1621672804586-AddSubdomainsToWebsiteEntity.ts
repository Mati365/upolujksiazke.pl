/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddSubdomainsToWebsiteEntity1621672804586 implements MigrationInterface {
  name = 'AddSubdomainsToWebsiteEntity1621672804586';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_website" ADD "withSubdomains" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_website" DROP COLUMN "withSubdomains"`);
  }
}
