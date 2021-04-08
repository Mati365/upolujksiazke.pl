/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddBookGenreEntity1617882441937 implements MigrationInterface {
  name = 'AddBookGenreEntity1617882441937';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TABLE "book_genre" ("id" SERIAL NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "parameterizedName" text NOT NULL, "name" citext NOT NULL, CONSTRAINT "UQ_02a1a69e133078f6a336a877f12" UNIQUE ("parameterizedName"), CONSTRAINT "PK_f316eed809f6f7617821012ad05" PRIMARY KEY ("id"))`);
    await queryRunner.query(`CREATE TABLE "book_genre_book_genre" ("bookId" integer NOT NULL, "bookGenreId" integer NOT NULL, CONSTRAINT "PK_5aeb5f7fc2ebfdf05d0a638a70b" PRIMARY KEY ("bookId", "bookGenreId"))`);
    await queryRunner.query(`CREATE INDEX "IDX_264f8d476294784bebe65c6140" ON "book_genre_book_genre" ("bookId") `);
    await queryRunner.query(`CREATE INDEX "IDX_41a43e80b41cd19cbc3a30605b" ON "book_genre_book_genre" ("bookGenreId") `);
    await queryRunner.query(`ALTER TABLE "book_genre_book_genre" ADD CONSTRAINT "FK_264f8d476294784bebe65c61401" FOREIGN KEY ("bookId") REFERENCES "book"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    await queryRunner.query(`ALTER TABLE "book_genre_book_genre" ADD CONSTRAINT "FK_41a43e80b41cd19cbc3a30605bc" FOREIGN KEY ("bookGenreId") REFERENCES "book_genre"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book_genre_book_genre" DROP CONSTRAINT "FK_41a43e80b41cd19cbc3a30605bc"`);
    await queryRunner.query(`ALTER TABLE "book_genre_book_genre" DROP CONSTRAINT "FK_264f8d476294784bebe65c61401"`);
    await queryRunner.query(`DROP INDEX "IDX_41a43e80b41cd19cbc3a30605b"`);
    await queryRunner.query(`DROP INDEX "IDX_264f8d476294784bebe65c6140"`);
    await queryRunner.query(`DROP TABLE "book_genre_book_genre"`);
    await queryRunner.query(`DROP TABLE "book_genre"`);
  }
}
