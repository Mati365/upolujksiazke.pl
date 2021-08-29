/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddRemoteArticleConstraint1618224377708 implements MigrationInterface {
  name = 'AddRemoteArticleConstraint1618224377708';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX "IDX_e496bf79b1a9f8bd3003e5969e" ON "scrapper_article" ("websiteId") `);
    await queryRunner.query(`ALTER TABLE "scrapper_article" ADD CONSTRAINT "scrapper_article_unique_remote_website" UNIQUE ("websiteId", "remoteId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "scrapper_article" DROP CONSTRAINT "scrapper_article_unique_remote_website"`);
    await queryRunner.query(`DROP INDEX "IDX_e496bf79b1a9f8bd3003e5969e"`);
  }
}
