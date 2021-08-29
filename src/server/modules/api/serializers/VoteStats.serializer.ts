import {Expose} from 'class-transformer';
import {VoteStatsRecord} from '@api/types';

export class VoteStatsSerializer implements VoteStatsRecord {
  @Expose() upvotes: number;
  @Expose() downvotes: number;
  @Expose() comments: number;
}
