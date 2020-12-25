/* eslint-disable max-len */
import {Migration} from '@mikro-orm/migrations';

export class InitialMigration20201225102647 extends Migration {
  async up(): Promise<void> {
    this.addSql('create table "scrapper_website" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "url" varchar(255) not null, "description" varchar(255) not null, "title" varchar(255) not null, "favicon_url" varchar(255) not null);');
    this.addSql('alter table "scrapper_website" add constraint "scrapper_website_url_unique" unique ("url");');

    this.addSql('create table "scrapper_metadata" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "website_id" int4 not null, "remote_id" integer not null, "content" jsonb not null, "status" text check ("status" in (\'imported\', \'processing\', \'new\')) not null);');
    this.addSql('alter table "scrapper_metadata" add constraint "scrapper_metadata_remote_id_unique" unique ("remote_id");');
    this.addSql('create index "scrapper_metadata_status_index" on "scrapper_metadata" ("status");');

    this.addSql('create table "book" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "title" varchar(255) not null, "isbn" varchar(255) not null, "description" text not null);');
    this.addSql('alter table "book" add constraint "book_isbn_unique" unique ("isbn");');

    this.addSql('create table "book_review" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "nick" varchar(255) not null, "description" text not null, "rating" smallint not null, "book_id" int4 not null, "scrapper_metadata_id" int4 not null);');
    this.addSql('alter table "book_review" add constraint "book_review_scrapper_metadata_id_unique" unique ("scrapper_metadata_id");');

    this.addSql('create table "author" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null);');

    this.addSql('create table "book_authors" ("book_entity_id" int4 not null, "author_entity_id" int4 not null);');
    this.addSql('alter table "book_authors" add constraint "book_authors_pkey" primary key ("book_entity_id", "author_entity_id");');

    this.addSql('alter table "scrapper_metadata" add constraint "scrapper_metadata_website_id_foreign" foreign key ("website_id") references "scrapper_website" ("id") on update cascade;');

    this.addSql('alter table "book_review" add constraint "book_review_book_id_foreign" foreign key ("book_id") references "book" ("id") on update cascade;');
    this.addSql('alter table "book_review" add constraint "book_review_scrapper_metadata_id_foreign" foreign key ("scrapper_metadata_id") references "scrapper_metadata" ("id") on update cascade;');

    this.addSql('alter table "book_authors" add constraint "book_authors_book_entity_id_foreign" foreign key ("book_entity_id") references "book" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "book_authors" add constraint "book_authors_author_entity_id_foreign" foreign key ("author_entity_id") references "author" ("id") on update cascade on delete cascade;');
  }
}
