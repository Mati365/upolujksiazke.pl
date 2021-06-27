import {
  ChildEntity, Index, JoinColumn,
  Column, ManyToOne, RelationId,
} from 'typeorm';

import {UserReactionRecordType} from '@shared/enums';
import {UserReactionEntity} from '@server/modules/reactions';
import {BookReviewEntity} from './BookReview.entity';

@ChildEntity(UserReactionRecordType.BOOK_REVIEW)
@Index(['review'])
export class BookReviewReactionEntity extends UserReactionEntity {
  @ManyToOne(() => BookReviewEntity, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'reviewId'})
  review: BookReviewEntity;

  @Column({nullable: false})
  @RelationId((entity: BookReviewReactionEntity) => entity.review)
  reviewId: number;

  constructor(partial: Partial<BookReviewReactionEntity>) {
    super();
    Object.assign(this, partial);
  }
}
