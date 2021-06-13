import {
  Column, ManyToMany, JoinTable,
  OneToMany, Index,
} from 'typeorm';

import {Gender} from '@shared/types';
import {ImageAttachmentEntity} from '@server/modules/attachment/entity';
import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity';

import {BookReviewEntity} from '../review/BookReview.entity';

@RemoteRecordEntity(
  {
    name: 'book_reviewer',
  },
)
@Index(['website'])
export class BookReviewerEntity extends RemoteRecordFields {
  static avatarTableName = 'book_reviewer_avatar_attachments';

  @Column('text')
  name: string;

  @Column(
    {
      type: 'enum',
      enum: Gender,
      default: Gender.UNKNOWN,
    },
  )
  gender: Gender;

  @OneToMany(() => BookReviewEntity, (entity) => entity.reviewer)
  reviews: BookReviewEntity[];

  @ManyToMany(
    () => ImageAttachmentEntity,
    {
      cascade: true,
      onDelete: 'CASCADE',
    },
  )
  @JoinTable(
    {
      name: BookReviewerEntity.avatarTableName,
    },
  )
  avatar: ImageAttachmentEntity[];

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<BookReviewerEntity>) {
    super(partial);
  }
}
