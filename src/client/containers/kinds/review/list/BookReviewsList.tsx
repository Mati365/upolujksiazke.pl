import React from 'react';
import c from 'classnames';

import {BookReviewRecord} from '@api/types';
import {CleanList} from '@client/components/ui';
import {BookReview, BookReviewProps} from '../cards/BookReview';

type BookReviewsListProps = {
  reviews: BookReviewRecord[],
  grid?: boolean,
  itemPropsFn?(item: BookReviewRecord, index: number): Partial<Omit<BookReviewProps, 'review'>>,
};

export const BookReviewsList = (
  {
    reviews,
    grid,
    itemPropsFn,
  }: BookReviewsListProps,
) => (
  <CleanList
    className={c(
      'c-book-reviews',
      grid && 'is-grid',
    )}
    inline={false}
    wrap
    block
  >
    {reviews.map(
      (review, index) => (
        <BookReview
          key={review.id}
          review={review}
          {...itemPropsFn?.(review, index)}
        />
      ),
    )}
  </CleanList>
);

BookReviewsList.displayName = 'BookReviewsList';
