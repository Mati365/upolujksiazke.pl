/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBookEntityHierarchicSeriesId1617272540942 implements MigrationInterface {
  name = 'AddBookEntityHierarchicSeriesId1617272540942';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" ADD "hierarchicSeriesId" integer`);
    await queryRunner.query(`CREATE INDEX "IDX_e71afa3cf983a4fc1c8aba2014" ON "book" ("hierarchicSeriesId") `);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_e71afa3cf983a4fc1c8aba20144" FOREIGN KEY ("hierarchicSeriesId") REFERENCES "book_series"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_e71afa3cf983a4fc1c8aba20144"`);
    await queryRunner.query(`DROP INDEX "IDX_e71afa3cf983a4fc1c8aba2014"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "hierarchicSeriesId"`);
  }
}
