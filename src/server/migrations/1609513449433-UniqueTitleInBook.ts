/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class UniqueTitleInBook1609513449433 implements MigrationInterface {
  name = 'UniqueTitleInBook1609513449433';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_authors_book_author" DROP CONSTRAINT "FK_1c40226a8adaefd568c229f78fe"`);
    await queryRunner.query(`ALTER TABLE "book_tags_tag" DROP CONSTRAINT "FK_a6b4c7652169240675f28e68123"`);
    await queryRunner.query(`DROP INDEX "IDX_1c40226a8adaefd568c229f78f"`);
    await queryRunner.query(`DROP INDEX "IDX_a6b4c7652169240675f28e6812"`);
    await queryRunner.query(`ALTER TABLE "book_authors_book_author" RENAME COLUMN "authorId" TO "bookAuthorId"`);
    await queryRunner.query(`ALTER TABLE "book_authors_book_author" RENAME CONSTRAINT "PK_81c5144967d42ebeac3d80ff01f" TO "PK_bb19a26e0b01ef67bf2beae4cd8"`);
    await queryRunner.query(`ALTER TABLE "book_tags_tag" RENAME COLUMN "tagsId" TO "tagId"`);
    await queryRunner.query(`ALTER TABLE "book_tags_tag" RENAME CONSTRAINT "PK_76a3229b181c990bf9852aa7640" TO "PK_37a9691c5c1ae26b78b47225c72"`);
    await queryRunner.query(`COMMENT ON COLUMN "tag"."id" IS NULL`);
    await queryRunner.query(`CREATE SEQUENCE "tag_id_seq" OWNED BY "tag"."id"`);
    await queryRunner.query(`ALTER TABLE "tag" ALTER COLUMN "id" SET DEFAULT nextval('tag_id_seq')`);
    await queryRunner.query(`COMMENT ON COLUMN "book_author"."id" IS NULL`);
    await queryRunner.query(`CREATE SEQUENCE "book_author_id_seq" OWNED BY "book_author"."id"`);
    await queryRunner.query(`ALTER TABLE "book_author" ALTER COLUMN "id" SET DEFAULT nextval('book_author_id_seq')`);
    await queryRunner.query(`COMMENT ON COLUMN "book_author"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_author" ADD CONSTRAINT "UQ_b62b34248c72f89fb6d27895e03" UNIQUE ("name")`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "UQ_c10a44a29ef231062f22b1b7ac5" UNIQUE ("title")`);
    await queryRunner.query(`CREATE INDEX "IDX_5d70a2909e4016261699c8fb8e" ON "book_authors_book_author" ("bookAuthorId") `);
    await queryRunner.query(`CREATE INDEX "IDX_5274aca0a1468ed55afdfaba24" ON "book_tags_tag" ("tagId") `);
    await queryRunner.query(`ALTER TABLE "book_authors_book_author" ADD CONSTRAINT "FK_5d70a2909e4016261699c8fb8ef" FOREIGN KEY ("bookAuthorId") REFERENCES "book_author"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_tags_tag" ADD CONSTRAINT "FK_5274aca0a1468ed55afdfaba244" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_tags_tag" DROP CONSTRAINT "FK_5274aca0a1468ed55afdfaba244"`);
    await queryRunner.query(`ALTER TABLE "book_authors_book_author" DROP CONSTRAINT "FK_5d70a2909e4016261699c8fb8ef"`);
    await queryRunner.query(`DROP INDEX "IDX_5274aca0a1468ed55afdfaba24"`);
    await queryRunner.query(`DROP INDEX "IDX_5d70a2909e4016261699c8fb8e"`);
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "UQ_c10a44a29ef231062f22b1b7ac5"`);
    await queryRunner.query(`COMMENT ON COLUMN "book"."title" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_author" DROP CONSTRAINT "UQ_b62b34248c72f89fb6d27895e03"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_author"."name" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_author" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`DROP SEQUENCE "book_author_id_seq"`);
    await queryRunner.query(`COMMENT ON COLUMN "book_author"."id" IS NULL`);
    await queryRunner.query(`ALTER TABLE "tag" ALTER COLUMN "id" DROP DEFAULT`);
    await queryRunner.query(`DROP SEQUENCE "tag_id_seq"`);
    await queryRunner.query(`COMMENT ON COLUMN "tag"."id" IS NULL`);
    await queryRunner.query(`ALTER TABLE "book_tags_tag" RENAME CONSTRAINT "PK_37a9691c5c1ae26b78b47225c72" TO "PK_76a3229b181c990bf9852aa7640"`);
    await queryRunner.query(`ALTER TABLE "book_tags_tag" RENAME COLUMN "tagId" TO "tagsId"`);
    await queryRunner.query(`ALTER TABLE "book_authors_book_author" RENAME CONSTRAINT "PK_bb19a26e0b01ef67bf2beae4cd8" TO "PK_81c5144967d42ebeac3d80ff01f"`);
    await queryRunner.query(`ALTER TABLE "book_authors_book_author" RENAME COLUMN "bookAuthorId" TO "authorId"`);
    await queryRunner.query(`CREATE INDEX "IDX_a6b4c7652169240675f28e6812" ON "book_tags_tag" ("tagsId") `);
    await queryRunner.query(`CREATE INDEX "IDX_1c40226a8adaefd568c229f78f" ON "book_authors_book_author" ("authorId") `);
    await queryRunner.query(`ALTER TABLE "book_tags_tag" ADD CONSTRAINT "FK_a6b4c7652169240675f28e68123" FOREIGN KEY ("tagsId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_authors_book_author" ADD CONSTRAINT "FK_1c40226a8adaefd568c229f78fe" FOREIGN KEY ("authorId") REFERENCES "book_author"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
