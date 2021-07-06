import {Column, Entity} from 'typeorm';

import {UserType} from '@shared/enums';
import {DatedRecordEntity} from '../database/DatedRecord.entity';

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

  constructor(partial: Partial<UserEntity>) {
    super();
    Object.assign(this, partial);
  }
}
