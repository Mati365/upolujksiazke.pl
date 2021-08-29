/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class DropRemoteDescription1611494635206 implements MigrationInterface {
  name = 'DropRemoteDescription1611494635206';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_df06c84447ceca4046650ce72c9"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "UQ_df06c84447ceca4046650ce72c9"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "remoteDescriptionId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" ADD "remoteDescriptionId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "UQ_df06c84447ceca4046650ce72c9" UNIQUE ("remoteDescriptionId")`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_df06c84447ceca4046650ce72c9" FOREIGN KEY ("remoteDescriptionId") REFERENCES "scrapper_remote_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
