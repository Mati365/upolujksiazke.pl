/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AddProtectionAndKindFields1611906820609 implements MigrationInterface {
  name = 'AddProtectionAndKindFields1611906820609';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "book_release_protection_enum" AS ENUM('1')`);
    await queryRunner.query(`ALTER TABLE "book_release" ADD "protection" "book_release_protection_enum"`);
    await queryRunner.query(`ALTER TABLE "book" ADD "kindId" integer`);
    await queryRunner.query(`ALTER TABLE "book" ADD CONSTRAINT "FK_90a10bebadd420bde862f2c9d06" FOREIGN KEY ("kindId") REFERENCES "book_kind"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "book" DROP CONSTRAINT "FK_90a10bebadd420bde862f2c9d06"`);
    await queryRunner.query(`ALTER TABLE "book" DROP COLUMN "kindId"`);
    await queryRunner.query(`ALTER TABLE "book_release" DROP COLUMN "protection"`);
    await queryRunner.query(`DROP TYPE "book_release_protection_enum"`);
  }
}
