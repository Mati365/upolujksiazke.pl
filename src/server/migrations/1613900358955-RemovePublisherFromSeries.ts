/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RemovePublisherFromSeries1613900358955 implements MigrationInterface {
  name = 'RemovePublisherFromSeries1613900358955';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_series" DROP CONSTRAINT "FK_3e53483e197911fbc961b9771d2"`);
    await queryRunner.query(`ALTER TABLE "book_series" DROP COLUMN "publisherId"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_series" ADD "publisherId" integer NOT NULL`);
    await queryRunner.query(`ALTER TABLE "book_series" ADD CONSTRAINT "FK_3e53483e197911fbc961b9771d2" FOREIGN KEY ("publisherId") REFERENCES "book_publisher"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
