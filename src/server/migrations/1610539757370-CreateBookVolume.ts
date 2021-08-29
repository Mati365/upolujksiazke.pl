/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class CreateBookVolume1610539757370 implements MigrationInterface {
  name = 'CreateBookVolume1610539757370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "book_volume" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "bookId" integer NOT NULL, "name" citext NOT NULL, CONSTRAINT "UQ_758f0cd7a2216d070aaf8ef0231" UNIQUE ("name"), CONSTRAINT "PK_66d0fbcd9bea65560f1714ef961" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "volumeId" integer`);
    await queryRunner.query(`ALTER TABLE "book_volume" ADD CONSTRAINT "FK_53231db1ba83c2c270dc8f54af0" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_c26c36fe0f31695f20716ac5e90" FOREIGN KEY ("volumeId") REFERENCES "book_volume"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_c26c36fe0f31695f20716ac5e90"`);
    await queryRunner.query(`ALTER TABLE "book_volume" DROP CONSTRAINT "FK_53231db1ba83c2c270dc8f54af0"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "volumeId"`);
    await queryRunner.query(`DROP TABLE "book_volume"`);
  }
}
