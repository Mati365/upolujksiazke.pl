import {APIPaginationResult, BasicAPIPagination} from '@api/APIClient';
import {APIRepo} from '../APIRepo';
import {BookReviewRecord} from '../types/BookReview.record';

export type BookReviewsFilters = BasicAPIPagination & {
  bookId?: number,
};

export type BookReviewsPaginationResult = APIPaginationResult<BookReviewRecord>;

export interface BookReviewsRepo extends APIRepo<BookReviewRecord, BookReviewsFilters> {}
