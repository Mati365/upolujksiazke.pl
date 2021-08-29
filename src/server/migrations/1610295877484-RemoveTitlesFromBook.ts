/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RemoveTitlesFromBook1610295877484 implements MigrationInterface {
  name = 'RemoveTitlesFromBook1610295877484';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_edb3281a91878b1c165f9120c41"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_edb3281a91878b1c165f9120c41"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "remoteDescriptionId"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "remoteDescriptionId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "UQ_df06c84447ceca4046650ce72c9" UNIQUE ("remoteDescriptionId")`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_df06c84447ceca4046650ce72c9" FOREIGN KEY ("remoteDescriptionId") REFERENCES "scrapper_remote_record"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_df06c84447ceca4046650ce72c9"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "UQ_df06c84447ceca4046650ce72c9"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "remoteDescriptionId"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "remoteDescriptionId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_edb3281a91878b1c165f9120c41" UNIQUE ("remoteDescriptionId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_edb3281a91878b1c165f9120c41" FOREIGN KEY ("remoteDescriptionId") REFERENCES "scrapper_remote_record"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }
}
