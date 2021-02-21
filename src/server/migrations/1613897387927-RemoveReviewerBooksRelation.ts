import {MigrationInterface, QueryRunner} from 'typeorm';

export class RemoveReviewerBooksRelation1613897387927 implements MigrationInterface {
  name = 'RemoveReviewerBooksRelation1613897387927';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE book_reviewers_book_reviewer');
  }

  public async down(): Promise<void> {
    return null;
  }
}
