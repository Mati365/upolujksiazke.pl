/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddMissingJoinTable1610818038622 implements MigrationInterface {
  name = 'AddMissingJoinTable1610818038622';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "book_release_cover_image_attachments" ("bookReleaseId" integer NOT NULL, "imageAttachmentsId" integer NOT NULL, CONSTRAINT "PK_0dae2dda0dee79d3f2f18a9288f" PRIMARY KEY ("bookReleaseId", "imageAttachmentsId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_7e34b90700abd75223ff1cc595" ON "book_release_cover_image_attachments" ("bookReleaseId") `);
    await queryRunner.query(`CREATE INDEX "IDX_75077d7c8556f16f5922866287" ON "book_release_cover_image_attachments" ("imageAttachmentsId") `);
    await queryRunner.query(`ALTER TABLE "book_release_cover_image_attachments" ADD CONSTRAINT "FK_7e34b90700abd75223ff1cc5951" FOREIGN KEY ("bookReleaseId") REFERENCES "book_release"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_release_cover_image_attachments" ADD CONSTRAINT "FK_75077d7c8556f16f5922866287c" FOREIGN KEY ("imageAttachmentsId") REFERENCES "image_attachments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_release_cover_image_attachments" DROP CONSTRAINT "FK_75077d7c8556f16f5922866287c"`);
    await queryRunner.query(`ALTER TABLE "book_release_cover_image_attachments" DROP CONSTRAINT "FK_7e34b90700abd75223ff1cc5951"`);
    await queryRunner.query(`DROP INDEX "IDX_75077d7c8556f16f5922866287"`);
    await queryRunner.query(`DROP INDEX "IDX_7e34b90700abd75223ff1cc595"`);
    await queryRunner.query(`DROP TABLE "book_release_cover_image_attachments"`);
  }
}
