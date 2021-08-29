/* eslint-disable max-len, quotes, @typescript-eslint/quotes */
import {MigrationInterface, QueryRunner} from 'typeorm';

export class AllowNullUsersReactions1624800507597 implements MigrationInterface {
  name = 'AllowNullUsersReactions1624800507597';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_reaction" DROP CONSTRAINT "FK_2837f62bbe886cd3ab6934ec80e"`);
    await queryRunner.query(`ALTER TABLE "user_reaction" ALTER COLUMN "userId" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_reaction" ADD CONSTRAINT "FK_2837f62bbe886cd3ab6934ec80e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_reaction" DROP CONSTRAINT "FK_2837f62bbe886cd3ab6934ec80e"`);
    await queryRunner.query(`ALTER TABLE "user_reaction" ALTER COLUMN "userId" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "user_reaction" ADD CONSTRAINT "FK_2837f62bbe886cd3ab6934ec80e" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
  }
}
