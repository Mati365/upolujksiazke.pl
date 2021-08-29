/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBookReviewReactions1624789308639 implements MigrationInterface {
  name = 'AddBookReviewReactions1624789308639';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "user_reaction_reaction_enum" AS ENUM('1', '2')`);
    await queryRunner.query(`CREATE TYPE "user_reaction_type_enum" AS ENUM('book_review_reaction')`);
    await queryRunner.query(`CREATE TABLE "user_reaction" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "reaction" "user_reaction_reaction_enum" NOT NULL, "type" "user_reaction_type_enum" NOT NULL, "reviewId" integer, CONSTRAINT "PK_265ee0acdb2cc16fe9eb8931423" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE INDEX "IDX_fc862d917d21fda8e19000477d" ON "user_reaction" ("reviewId") `);
    await queryRunner.query(`CREATE INDEX "IDX_475fb46a00ea61037431eabd17" ON "user_reaction" ("type") `);
    await queryRunner.query(`ALTER TABLE "user_reaction" ADD CONSTRAINT "FK_fc862d917d21fda8e19000477d3" FOREIGN KEY ("reviewId") REFERENCES "book_review"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_reaction" DROP CONSTRAINT "FK_fc862d917d21fda8e19000477d3"`);
    await queryRunner.query(`DROP INDEX "IDX_475fb46a00ea61037431eabd17"`);
    await queryRunner.query(`DROP INDEX "IDX_fc862d917d21fda8e19000477d"`);
    await queryRunner.query(`DROP TABLE "user_reaction"`);
    await queryRunner.query(`DROP TYPE "user_reaction_type_enum"`);
    await queryRunner.query(`DROP TYPE "user_reaction_reaction_enum"`);
  }
}
