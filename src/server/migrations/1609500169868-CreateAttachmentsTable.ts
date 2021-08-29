/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateAttachmentsTable1609500169868 implements MigrationInterface {
  name = 'CreateAttachmentsTable1609500169868';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "attachments" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "mimetype" character varying(140) NOT NULL, "size" bigint NOT NULL, "file" text NOT NULL, "name" text NOT NULL, CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "attachments"`);
  }
}
