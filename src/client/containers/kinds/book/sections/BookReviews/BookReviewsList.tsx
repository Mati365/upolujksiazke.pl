import React from 'react';

import {BookReviewRecord} from '@api/types';
import {CleanList} from '@client/components/ui';
import {BookReview} from './BookReview';

type BookReviewsListProps = {
  reviews: BookReviewRecord[],
};

export const BookReviewsList = ({reviews}: BookReviewsListProps) => (
  <CleanList
    className='c-book-reviews'
    inline={false}
    wrap
    block
  >
    {reviews.map(
      (review) => (
        <BookReview
          key={review.id}
          review={review}
        />
      ),
    )}
  </CleanList>
);

BookReviewsList.displayName = 'BookReviewsList';
