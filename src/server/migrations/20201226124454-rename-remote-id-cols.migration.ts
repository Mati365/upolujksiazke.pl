import {Migration} from '@mikro-orm/migrations';

export class RenameRemoteIdCols20201226124454Migration extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "book_reviewer" rename column "remote_entity_remote_id" to "remote_entity_id";');
    this.addSql('alter table "book_review" rename column "remote_entity_remote_id" to "remote_entity_id";');
  }
}
