/* eslint-disable max-len */
import {Migration} from '@mikro-orm/migrations';

export class ChangeUniqueMetadataFieldMigration20201225142933 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "scrapper_metadata" drop constraint "scrapper_metadata_remote_id_unique";');
    this.addSql('alter table "scrapper_metadata" add constraint "scrapper_metadata_remote_id_website_id_unique" unique ("remote_id", "website_id");');
  }
}
