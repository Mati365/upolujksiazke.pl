import {
  Column, ManyToMany, JoinTable,
  OneToMany, Index, OneToOne,
  JoinColumn, RelationId,
} from 'typeorm';

import {Gender} from '@shared/types';
import {ImageAttachmentEntity} from '@server/modules/attachment/entity';
import {RemoteRecordEntity, RemoteRecordFields} from '@server/modules/remote/entity';
import {UserEntity} from '@server/modules/user/User.entity';
import {BookReviewEntity} from '../review/entity/BookReview.entity';

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

  @Column('boolean', {default: false, nullable: true})
  hidden: boolean;

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

  @OneToMany(() => BookReviewEntity, (entity) => entity.linkingReviewer)
  linkedReviews: BookReviewEntity[];

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

  @OneToOne(
    () => UserEntity,
    (entity) => entity.reviewer,
    {
      cascade: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({name: 'userId'})
  user: UserEntity;

  @Column({nullable: true})
  @RelationId((entity: BookReviewerEntity) => entity.user)
  userId: number;

  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(partial: Partial<BookReviewerEntity>) {
    super(partial);
  }
}
