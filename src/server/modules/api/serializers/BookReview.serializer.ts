import {Expose, Type, Transform} from 'class-transformer';

import {BookReviewRecord} from '@api/types';
import {BaseSerializer} from './Base.serializer';
import {BookReviewerSerializer} from './BookReviewer.serializer';
import {VoteStatsSerializer} from './VoteStats.serializer';
import {WebsiteSerializer} from './Website.serializer';
import {BookCardSerializer} from './BookCard.serializer';

export class BookReviewSerializer extends BaseSerializer implements BookReviewRecord {
  @Expose()
  url: string;

  @Expose()
  quote: boolean;

  @Expose()
  @Transform(({value}) => new Date(value), {toClassOnly: true})
  publishDate: Date;

  @Expose() description: string;
  @Expose() rating: number;

  @Expose()
  @Type(() => VoteStatsSerializer)
  stats: VoteStatsSerializer;

  @Expose()
  @Type(() => BookReviewerSerializer)
  reviewer: BookReviewerSerializer;

  @Expose()
  @Type(() => WebsiteSerializer)
  website: WebsiteSerializer;

  @Expose()
  @Type(() => BookCardSerializer)
  book?: BookCardSerializer;
}
