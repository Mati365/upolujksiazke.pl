/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddPublisherAvailabilityReleaseTables1609676822422 implements MigrationInterface {
  name = 'AddPublisherAvailabilityReleaseTables1609676822422';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_efd835439a820b87727ebfa9169"`);
    await queryRunner.query(`DROP INDEX "IDX_bd183604b9c828c0bdd92cafab"`);
    await queryRunner.query(`CREATE TABLE "book_publisher" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" text NOT NULL, "websiteURL" text, "description" text, "address" text, CONSTRAINT "UQ_cd55e265ba094499c1c5c1ab69f" UNIQUE ("name"), CONSTRAINT "PK_baaa4c0d27070b4125aa5a81e25" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_release" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "place" text, "isbn" text NOT NULL, "format" text NOT NULL, "publisherId" integer, "bookId" integer, CONSTRAINT "unique_publisher_isbn" UNIQUE ("isbn", "publisherId"), CONSTRAINT "PK_6c2ce16ab4d9db5ef49628a890d" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_availability" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "price" money, "remoteId" integer, CONSTRAINT "REL_5e2e479d0fae4458805ce7ee8e" UNIQUE ("remoteId"), CONSTRAINT "PK_6b132aa4881ee6bab8692b12a05" PRIMARY KEY ("id"))`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "isbn"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_efd835439a820b87727ebfa9169"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "remoteId"`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_9335d029f2b0700b6677178c90e" FOREIGN KEY ("publisherId") REFERENCES "book_publisher"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD CONSTRAINT "FK_0cbd0caed48b7acdd31f56bdc7a" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_availability" ADD CONSTRAINT "FK_5e2e479d0fae4458805ce7ee8e5" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_availability" DROP CONSTRAINT "FK_5e2e479d0fae4458805ce7ee8e5"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_0cbd0caed48b7acdd31f56bdc7a"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP CONSTRAINT "FK_9335d029f2b0700b6677178c90e"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "remoteId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_efd835439a820b87727ebfa9169" UNIQUE ("remoteId")`);
    await queryRunner.query(`ALTER TABLE "book" ADD "isbn" text NOT NULL`);
    await queryRunner.query(`DROP TABLE "book_availability"`);
    await queryRunner.query(`DROP TABLE "book_release"`);
    await queryRunner.query(`DROP TABLE "book_publisher"`);
    await queryRunner.query(`CREATE UNIQUE INDEX "IDX_bd183604b9c828c0bdd92cafab" ON "book" ("isbn") `);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_efd835439a820b87727ebfa9169" FOREIGN KEY ("remoteId") REFERENCES "scrapper_remote_record"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
  }
}
