/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddIndexToBookSummary1624607602914 implements MigrationInterface {
  name = 'AddIndexToBookSummary1624607602914';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_17de51f0880e6ecc1f95e648ef"`);
    await queryRunner.query(`CREATE INDEX "IDX_34b3b9ba610c324499c03c54da" ON "book_summary" ("bookId", "kind") `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_34b3b9ba610c324499c03c54da"`);
    await queryRunner.query(`CREATE INDEX "IDX_17de51f0880e6ecc1f95e648ef" ON "book_summary" ("bookId") `);
  }
}
