/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddScrapperMetadataToBook1609692022246 implements MigrationInterface {
  name = 'AddScrapperMetadataToBook1609692022246';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "scrapperMetadataId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_f25a1b2e44c31fa57cb8d8d1f40" UNIQUE ("scrapperMetadataId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_f25a1b2e44c31fa57cb8d8d1f40" FOREIGN KEY ("scrapperMetadataId") REFERENCES "scrapper_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_f25a1b2e44c31fa57cb8d8d1f40"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_f25a1b2e44c31fa57cb8d8d1f40"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "scrapperMetadataId"`);
  }
}
