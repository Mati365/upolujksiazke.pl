/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RenameSourceUrlInAttachement1610190784625 implements MigrationInterface {
  name = 'RenameSourceUrlInAttachement1610190784625';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attachments" RENAME COLUMN "sourceUrl" TO "originalUrl"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "attachments" RENAME COLUMN "originalUrl" TO "sourceUrl"`);
  }
}
