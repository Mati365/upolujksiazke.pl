/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class DropLastSeen1625595364188 implements MigrationInterface {
  name = 'DropLastSeen1625595364188';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastSeenAt"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" ADD "lastSeenAt" TIMESTAMP NOT NULL DEFAULT now()`);
  }
}
