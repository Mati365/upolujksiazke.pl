import {CanBePromise, UserReactionType} from '@shared/types';
import {APIPaginationResult, BasicAPIPagination} from '@api/APIClient';
import {APIRepo} from '../APIRepo';
import {BookReviewRecord} from '../types/BookReview.record';
import {VoteStatsRecord} from '../types/VoteStatsRecord.record';

export type BookReviewsFilters = BasicAPIPagination & {
  bookId?: number,
};

export type RecentCommentedBooksFilters = BasicAPIPagination & {
  limit: number,
};

export type BookReviewsPaginationResult = APIPaginationResult<BookReviewRecord>;

export type CreateBookReviewReactionAttrs = {
  id: number,
  reaction: UserReactionType,
};

export type CreateBookReactionResult = {
  stats: VoteStatsRecord,
};

export interface BookReviewsRepo extends APIRepo<BookReviewRecord, BookReviewsFilters> {
  findRecentCommentedBooks?(attrs: RecentCommentedBooksFilters): CanBePromise<BookReviewRecord[]>;
  react?(attrs: CreateBookReviewReactionAttrs): CanBePromise<CreateBookReactionResult>;
}
