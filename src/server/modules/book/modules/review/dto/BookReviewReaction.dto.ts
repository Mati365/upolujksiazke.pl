import {IsDefined, IsNumber} from 'class-validator';
import {UserReactionDto} from '@server/modules/reactions/dto/UserReaction.dto';

export class BookReviewReactionDto extends UserReactionDto {
  @IsDefined()
  @IsNumber()
  id: number;
}
