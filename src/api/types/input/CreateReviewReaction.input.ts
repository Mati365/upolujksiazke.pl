import {UserReactionType} from '@shared/enums';

export interface CreateReviewReactionInput {
  id: number;
  reaction: UserReactionType;
}
