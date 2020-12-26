/* eslint-disable max-len */
import {Migration} from '@mikro-orm/migrations';

export class AddBookCategoryEntityMigration20201226110702 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table "book_category" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null);');

    this.addSql('create table "book_categories" ("book_entity_id" int4 not null, "book_category_entity_id" int4 not null);');
    this.addSql('alter table "book_categories" add constraint "book_categories_pkey" primary key ("book_entity_id", "book_category_entity_id");');

    this.addSql('alter table "book_categories" add constraint "book_categories_book_entity_id_foreign" foreign key ("book_entity_id") references "book" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "book_categories" add constraint "book_categories_book_category_entity_id_foreign" foreign key ("book_category_entity_id") references "book_category" ("id") on update cascade on delete cascade;');
  }
}
