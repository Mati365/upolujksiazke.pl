import {Column, Entity, OneToOne} from 'typeorm';

import {UserType} from '@shared/enums';
import {DatedRecordEntity} from '../database/DatedRecord.entity';
import {BookReviewerEntity} from '../book/modules/reviewer/BookReviewer.entity';

@Entity('user')
export class UserEntity extends DatedRecordEntity {
  @Column(
    {
      type: 'enum',
      enum: UserType,
      nullable: false,
    },
  )
  type: UserType = UserType.ANONYMOUS;

  @Column('text', {nullable: false})
  refreshToken: string;

  @OneToOne(() => BookReviewerEntity, (entity) => entity.user)
  reviewer: BookReviewerEntity;

  constructor(partial: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }
}
