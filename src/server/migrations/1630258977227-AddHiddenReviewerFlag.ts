/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddHiddenReviewerFlag1630258977227 implements MigrationInterface {
  name = 'AddHiddenReviewerFlag1630258977227';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."book_reviewer" ADD "hidden" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."book_reviewer" DROP COLUMN "hidden"`);
  }
}
