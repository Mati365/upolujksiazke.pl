/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RenameRemoteDescriptionCol1610280032624 implements MigrationInterface {
  name = 'RenameRemoteDescriptionCol1610280032624';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_efd835439a820b87727ebfa9169"`);
    await queryRunner.query(`ALTER TABLE "book" RENAME COLUMN "remoteId" TO "remoteDescriptionId"`);
    await queryRunner.query(`ALTER TABLE "book" RENAME CONSTRAINT "UQ_efd835439a820b87727ebfa9169" TO "UQ_edb3281a91878b1c165f9120c41"`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_edb3281a91878b1c165f9120c41" FOREIGN KEY ("remoteDescriptionId") REFERENCES "scrapper_remote_record"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_edb3281a91878b1c165f9120c41"`);
    await queryRunner.query(`ALTER TABLE "book" RENAME CONSTRAINT "UQ_edb3281a91878b1c165f9120c41" TO "UQ_efd835439a820b87727ebfa9169"`);
    await queryRunner.query(`ALTER TABLE "book" RENAME COLUMN "remoteDescriptionId" TO "remoteId"`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_efd835439a820b87727ebfa9169" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }
}
