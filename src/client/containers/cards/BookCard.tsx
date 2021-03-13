import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {BookCardRecord} from '@api/types';
import {Picture} from '@client/components/ui';
import {RatingsRow} from '../parts/RatingsRow';

type BookCardProps = {
  item: BookCardRecord,
  withDescription?: boolean,
};

export const BookCard = (
  {
    withDescription,
    item: {
      avgRating,
      totalRatings,
      authors,
      primaryRelease,
    },
  }: BookCardProps,
) => (
  <article
    className={c(
      'c-book-card',
      withDescription && 'has-description',
    )}
  >
    <Picture
      className='c-book-card__cover'
      alt={primaryRelease.title}
      src={primaryRelease.cover.preview.file}
    />

    <RatingsRow
      className='c-book-card__ratings'
      value={avgRating / 10}
      totalReviews={totalRatings}
    />

    <h3 className='c-book-card__title is-text-semibold is-text-small'>
      {primaryRelease.title}
    </h3>

    <div className='c-book-card__author'>
      {R.pluck('name', authors).join(', ')}
    </div>
  </article>
);

BookCard.displayName = 'BookCard';
