/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBookAlias1614675945442 implements MigrationInterface {
  name = 'AddBookAlias1614675945442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "book_alias" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "srcSlug" text NOT NULL, "destSlug" text NOT NULL, CONSTRAINT "UQ_8b13a45df54e9c34476d5eb0957" UNIQUE ("srcSlug"), CONSTRAINT "PK_6bc610836921f2f9199c76d9ed4" PRIMARY KEY ("id"))`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "book_alias"`);
  }
}
