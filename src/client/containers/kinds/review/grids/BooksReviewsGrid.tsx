import React from 'react';

import {BookReviewRecord} from '@api/types';
import {BookLink} from '@client/routes/Links';
import {BookReviewsList} from '../list/BookReviewsList';

type BooksReviewsGridProps = {
  items: BookReviewRecord[],
};

export const BooksReviewsGrid = ({items}: BooksReviewsGridProps) => (
  <BookReviewsList
    grid
    reviews={items}
    itemPropsFn={
      (review) => ({
        showBookCard: true,
        showReactionsTitles: false,
        totalRatingStars: 6,
        moreButtonRenderFn: ({expandTitle}) => (
          <BookLink
            className='c-promo-tag-link is-text-semibold is-text-no-wrap ml-2'
            undecorated={false}
            item={review.book}
            withChevron
          >
            {expandTitle}
          </BookLink>
        ),
      })
    }
  />
);

BooksReviewsGrid.displayName = 'BooksReviewsGrid';
