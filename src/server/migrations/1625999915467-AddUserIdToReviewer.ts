/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddUserIdToReviewer1625999915467 implements MigrationInterface {
  name = 'AddUserIdToReviewer1625999915467';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD "userId" integer`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "UQ_8f88c33d20875d17d2c74b07b45" UNIQUE ("userId")`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" ADD CONSTRAINT "FK_8f88c33d20875d17d2c74b07b45" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "FK_8f88c33d20875d17d2c74b07b45"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP CONSTRAINT "UQ_8f88c33d20875d17d2c74b07b45"`);
    await queryRunner.query(`ALTER TABLE "book_reviewer" DROP COLUMN "userId"`);
  }
}
