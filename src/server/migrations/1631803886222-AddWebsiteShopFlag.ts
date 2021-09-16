/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from "typeorm";

export class AddWebsiteShopFlag1631803886222 implements MigrationInterface {
  name = 'AddWebsiteShopFlag1631803886222';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."scrapper_website" ADD "shop" boolean DEFAULT false`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "public"."scrapper_website" DROP COLUMN "shop"`);
  }
}
