import {MigrationInterface, QueryRunner} from 'typeorm';

export class DropRemoteRecordTable1611502394085 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('scrapper_remote_record');
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  public async down(): Promise<void> {}
}
