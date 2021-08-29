import {IsDefined, IsEnum} from 'class-validator';
import {
  UserReactionRecordType,
  UserReactionType,
} from '@shared/enums';

export class UserReactionDto {
  @IsDefined()
  @IsEnum(UserReactionType)
  reaction: UserReactionType;
}

export class UserTypedReactionDto extends UserReactionDto {
  @IsDefined()
  @IsEnum(UserReactionRecordType)
  type: UserReactionRecordType;
}
