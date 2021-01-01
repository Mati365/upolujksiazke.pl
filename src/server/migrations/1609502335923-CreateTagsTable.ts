/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateTagsTable1609502335923 implements MigrationInterface {
  name = 'CreateTagsTable1609502335923';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "tags" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(60) NOT NULL, CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" UNIQUE ("name"), CONSTRAINT "PK_e7dc17249a1148a1970748eda99" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_tags_tags" ("bookId" integer NOT NULL, "tagsId" integer NOT NULL, CONSTRAINT "PK_85f2bb1bacbf8299b9374cea0ab" PRIMARY KEY ("bookId", "tagsId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_70498f17c05547b11117220ccd" ON "book_tags_tags" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_86f9057982e64a3caed23eb057" ON "book_tags_tags" ("tagsId") `);
    await queryRunner.query(`ALTER TABLE "book_tags_tags" ADD CONSTRAINT "FK_70498f17c05547b11117220ccd9" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_tags_tags" ADD CONSTRAINT "FK_86f9057982e64a3caed23eb0577" FOREIGN KEY ("tagsId") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_tags_tags" DROP CONSTRAINT "FK_86f9057982e64a3caed23eb0577"`);
    await queryRunner.query(`ALTER TABLE "book_tags_tags" DROP CONSTRAINT "FK_70498f17c05547b11117220ccd9"`);
    await queryRunner.query(`DROP INDEX "IDX_86f9057982e64a3caed23eb057"`);
    await queryRunner.query(`DROP INDEX "IDX_70498f17c05547b11117220ccd"`);
    await queryRunner.query(`DROP TABLE "book_tags_tags"`);
    await queryRunner.query(`DROP TABLE "tags"`);
  }
}
