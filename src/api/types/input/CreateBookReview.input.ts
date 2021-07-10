import * as R from 'ramda';

export const MIN_BOOK_REVIEW_LENGTH = 3;
export const MAX_BOOK_REVIEW_LENGTH = 855;

export interface CreateBookReviewExternalRef {
  __id?: any,
  url?: string;
  description?: string;
  rating?: number;
  nick?: string;
}

export interface CreateBookReviewInput extends CreateBookReviewExternalRef {
  externalRefs?: CreateBookReviewExternalRef[];
}

export function prevalidateBookReview(review: CreateBookReviewInput) {
  if (!review)
    return false;

  const length = review.description?.length;
  if (length > MAX_BOOK_REVIEW_LENGTH)
    return false;

  return (
    length > MIN_BOOK_REVIEW_LENGTH
      || (!length && !R.isNil(review.rating))
  );
}
