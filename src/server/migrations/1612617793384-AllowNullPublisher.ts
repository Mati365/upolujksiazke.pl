/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AllowNullPublisher1612617793384 implements MigrationInterface {
  name = 'AllowNullPublisher1612617793384';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_9335d029f2b0700b6677178c90e"`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "publisherId" DROP NOT NULL`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."publisherId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_9335d029f2b0700b6677178c90e" FOREIGN KEY ("publisherId") REFERENCES "book_publisher"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_9335d029f2b0700b6677178c90e"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_release"."publisherId" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ALTER COLUMN "publisherId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_9335d029f2b0700b6677178c90e" FOREIGN KEY ("publisherId") REFERENCES "book_publisher"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
