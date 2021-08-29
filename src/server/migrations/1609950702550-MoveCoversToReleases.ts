/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class MoveCoversToReleases1609950702550 implements MigrationInterface {
  name = 'MoveCoversToReleases1609950702550';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_ea921939b25c4a315e461fc886e"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "coverId"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "coverId" integer`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_c4020304ee17ccfdef1f5045ac6" FOREIGN KEY ("coverId") REFERENCES "attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_c4020304ee17ccfdef1f5045ac6"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "coverId"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "coverId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_ea921939b25c4a315e461fc886e" FOREIGN KEY ("coverId") REFERENCES "attachments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
