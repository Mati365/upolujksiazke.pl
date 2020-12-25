import {Migration} from '@mikro-orm/migrations';

export class ChangeMetadataStatusTypeMigration20201225111346 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "scrapper_metadata" drop constraint if exists "scrapper_metadata_status_check";');
    this.addSql('update "scrapper_metadata" set "status" = \'3\';');
    this.addSql('alter table "scrapper_metadata" alter column "status" type int2 using ("status"::int2);');
    this.addSql('alter table "scrapper_metadata" alter column "status" set default 3;');
  }
}
