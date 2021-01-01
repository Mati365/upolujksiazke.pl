/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class RenameTagsTable1609503307949 implements MigrationInterface {
  name = 'RenameTagsTable1609503307949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('tags', 'tag');
    await queryRunner.renameTable('book_tags_tags', 'book_tags_tag');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameTable('book_tags_tag', 'book_tags_tags');
    await queryRunner.renameTable('tag', 'tags');
  }
}
