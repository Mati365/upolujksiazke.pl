import React, {useMemo} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useUA} from '@client/modules/ua';

import {CleanList} from '@client/components/ui';
import {
  BookAvailabilityRecord,
  BookReviewRecord,
} from '@api/types';

import {BookWebsitesAvailabilityTable} from '../../book/sections/BookAvailability/BookWebsitesAvailabilityTable';
import {
  BookReview,
  BookReviewProps,
} from '../cards/BookReview';

type BookReviewsListProps = {
  reviews: BookReviewRecord[],
  availability?: BookAvailabilityRecord[],
  grid?: boolean,
  itemPropsFn?(item: BookReviewRecord, index: number): Partial<Omit<BookReviewProps, 'review'>>,
};

export const BookReviewsList = (
  {
    availability,
    reviews,
    grid,
    itemPropsFn,
  }: BookReviewsListProps,
) => {
  const ua = useUA();
  const groupedAvailability = useMemo(
    () => R.groupBy(
      (item) => item.website.id.toString(),
      availability || [],
    ),
    [availability],
  );

  return (
    <CleanList
      className={c(
        'c-book-reviews',
        grid && 'is-grid',
      )}
      inline={false}
      wrap
      block
    >
      {reviews.map((review, index) => {
        const reviewAvailabilityItems = R.take(2, groupedAvailability[review.website.id] || []);

        return (
          <BookReview
            key={review.id}
            review={review}
            {...itemPropsFn?.(review, index)}
            {...!R.isEmpty(reviewAvailabilityItems) && {
              footer: (
                <BookWebsitesAvailabilityTable
                  className='mt-3'
                  availability={reviewAvailabilityItems}
                  shrink={ua.mobile}
                  onlyWebsiteLogo
                  withType
                />
              ),
            }}
          />
        );
      })}
    </CleanList>
  );
};

BookReviewsList.displayName = 'BookReviewsList';
