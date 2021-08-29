import {CanBePromise} from '@shared/types';
import {APIPaginationResult, BasicAPIPagination} from '@api/APIClient';
import {APIRepo} from '../APIRepo';
import {BookReviewRecord} from '../types/BookReview.record';
import {VoteStatsRecord} from '../types/VoteStatsRecord.record';
import {
  CreateBookReviewInput,
  CreateReviewReactionInput,
} from '../types/input';

export type BookReviewsFilters = BasicAPIPagination & {
  bookId?: number,
};

export type RecentCommentedBooksFilters = BasicAPIPagination & {
  limit: number,
};

export type BookReviewsPaginationResult = APIPaginationResult<BookReviewRecord>;

export type CreateBookReactionResult = {
  stats: VoteStatsRecord,
};

export interface BookReviewsRepo extends APIRepo<BookReviewRecord, BookReviewsFilters> {
  findRecentCommentedBooks?(attrs: RecentCommentedBooksFilters): CanBePromise<BookReviewRecord[]>;
  addBookReview?(input: CreateBookReviewInput): Promise<void>;
  react?(attrs: CreateReviewReactionInput): CanBePromise<CreateBookReactionResult>;
}
