import {MigrationInterface, QueryRunner} from 'typeorm';

export class DropTableAliases1614958274872 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.dropTable('book_alias');
  }

  public async down(): Promise<void> {
    throw new Error('Not implemented!');
  }
}
