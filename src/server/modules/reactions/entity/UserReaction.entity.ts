import {
  Entity, TableInheritance, Column,
  ManyToOne, JoinColumn, RelationId,
} from 'typeorm';

import {UserEntity} from '@server/modules/user/User.entity';
import {
  UserReactionRecordType,
  UserReactionType,
} from '@shared/enums';

import {DatedRecordEntity} from '../../database/DatedRecord.entity';

@Entity('user_reaction')
@TableInheritance(
  {
    column: {
      type: 'enum',
      enum: UserReactionRecordType,
      name: 'type',
    },
  },
)
export class UserReactionEntity extends DatedRecordEntity {
  @Column(
    {
      type: 'enum',
      enum: UserReactionType,
    },
  )
  reaction: UserReactionType;

  @ManyToOne(() => UserEntity, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'userId'})
  user: UserEntity;

  @Column({nullable: true})
  @RelationId((entity: UserReactionEntity) => entity.user)
  userId: number;
}
