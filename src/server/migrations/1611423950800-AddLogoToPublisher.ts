/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddLogoToPublisher1611423950800 implements MigrationInterface {
  name = 'AddLogoToPublisher1611423950800';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "book_publisher_logo_image_attachments" ("bookPublisherId" integer NOT NULL, "imageAttachmentsId" integer NOT NULL, CONSTRAINT "PK_923d022bfd3e49e0c0d35bebc70" PRIMARY KEY ("bookPublisherId", "imageAttachmentsId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_7275880eff612d6920a1a71994" ON "book_publisher_logo_image_attachments" ("bookPublisherId") `);
    await queryRunner.query(`CREATE INDEX "IDX_37a2b137927b288fdb351c9548" ON "book_publisher_logo_image_attachments" ("imageAttachmentsId") `);
    await queryRunner.query(`ALTER TABLE "book_publisher_logo_image_attachments" ADD CONSTRAINT "FK_7275880eff612d6920a1a719948" FOREIGN KEY ("bookPublisherId") REFERENCES "book_publisher"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_publisher_logo_image_attachments" ADD CONSTRAINT "FK_37a2b137927b288fdb351c9548d" FOREIGN KEY ("imageAttachmentsId") REFERENCES "image_attachments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_publisher_logo_image_attachments" DROP CONSTRAINT "FK_37a2b137927b288fdb351c9548d"`);
    await queryRunner.query(`ALTER TABLE "book_publisher_logo_image_attachments" DROP CONSTRAINT "FK_7275880eff612d6920a1a719948"`);
    await queryRunner.query(`DROP INDEX "IDX_37a2b137927b288fdb351c9548"`);
    await queryRunner.query(`DROP INDEX "IDX_7275880eff612d6920a1a71994"`);
    await queryRunner.query(`DROP TABLE "book_publisher_logo_image_attachments"`);
  }
}
