/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class DropScrapperMetadataCols1610279833582 implements MigrationInterface {
  name = 'DropScrapperMetadataCols1610279833582';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "FK_ac1c02339c7d1a3a1f4037ee6c8"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_f25a1b2e44c31fa57cb8d8d1f40"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP CONSTRAINT "REL_ac1c02339c7d1a3a1f4037ee6c"`);
    await queryRunner.query(`ALTER TABLE "book_review" DROP COLUMN "scrapperMetadataId"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_f25a1b2e44c31fa57cb8d8d1f40"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "scrapperMetadataId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "scrapperMetadataId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_f25a1b2e44c31fa57cb8d8d1f40" UNIQUE ("scrapperMetadataId")`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD "scrapperMetadataId" integer`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "REL_ac1c02339c7d1a3a1f4037ee6c" UNIQUE ("scrapperMetadataId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_f25a1b2e44c31fa57cb8d8d1f40" FOREIGN KEY ("scrapperMetadataId") REFERENCES "scrapper_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_review" ADD CONSTRAINT "FK_ac1c02339c7d1a3a1f4037ee6c8" FOREIGN KEY ("scrapperMetadataId") REFERENCES "scrapper_metadata"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
