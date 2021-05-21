/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddViewsAggsEntities1621614176045 implements MigrationInterface {
  name = 'AddViewsAggsEntities1621614176045';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "views_agg_type_enum" AS ENUM('1')`);
    await queryRunner.query(`CREATE TABLE "views_agg" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "date" date NOT NULL, "type" "views_agg_type_enum" NOT NULL, "count" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_80fc35007d4e2f19e1568bf3d30" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_909fce7c8b5272f4d587a69932" ON "views_agg" ("type") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_909fce7c8b5272f4d587a69932"`);
    await queryRunner.query(`DROP TABLE "views_agg"`);
    await queryRunner.query(`DROP TYPE "views_agg_type_enum"`);
  }
}
