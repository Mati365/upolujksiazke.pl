/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddRemoteToBook1609591993698 implements MigrationInterface {
  name = 'AddRemoteToBook1609591993698';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "remoteId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_efd835439a820b87727ebfa9169" UNIQUE ("remoteId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_efd835439a820b87727ebfa9169" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_efd835439a820b87727ebfa9169"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_efd835439a820b87727ebfa9169"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "remoteId"`);
  }
}
