/* eslint-disable max-len */
import {Migration} from '@mikro-orm/migrations';

export class AddBookReviewers20201226120253Migration extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "scrapper_metadata" drop constraint if exists "scrapper_metadata_remote_id_check";');
    this.addSql('alter table "scrapper_metadata" alter column "remote_id" type varchar(255) using ("remote_id"::varchar(255));');

    this.addSql('create table "book_reviewer" ("id" serial primary key, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "name" varchar(255) not null, "gender" int2 not null, "remote_entity_remote_id" varchar(255) not null, "remote_entity_website_id" int4 not null);');

    this.addSql('alter table "book_review" add column "remote_entity_remote_id" varchar(255) not null, add column "remote_entity_website_id" int4 not null;');

    this.addSql('create table "book_reviewers" ("book_entity_id" int4 not null, "book_reviewer_entity_id" int4 not null);');
    this.addSql('alter table "book_reviewers" add constraint "book_reviewers_pkey" primary key ("book_entity_id", "book_reviewer_entity_id");');

    this.addSql('alter table "book_reviewer" add constraint "book_reviewer_remote_entity_website_id_foreign" foreign key ("remote_entity_website_id") references "scrapper_website" ("id") on update cascade;');

    this.addSql('alter table "book_review" add constraint "book_review_remote_entity_website_id_foreign" foreign key ("remote_entity_website_id") references "scrapper_website" ("id") on update cascade;');

    this.addSql('alter table "book_reviewers" add constraint "book_reviewers_book_entity_id_foreign" foreign key ("book_entity_id") references "book" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "book_reviewers" add constraint "book_reviewers_book_reviewer_entity_id_foreign" foreign key ("book_reviewer_entity_id") references "book_reviewer" ("id") on update cascade on delete cascade;');
  }
}
