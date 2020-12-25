/* eslint-disable max-len */
import {Migration} from '@mikro-orm/migrations';

export class AddKindToMetadataMigration20201225111013 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "scrapper_metadata" add column "kind" int2 not null default 1;');
    this.addSql('create index "scrapper_metadata_kind_index" on "scrapper_metadata" ("kind");');
  }
}
