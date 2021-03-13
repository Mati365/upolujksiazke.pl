import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';

import {BookCardRecord} from '@api/types';
import {Picture} from '@client/components/ui';
import {RatingsRow} from '../parts/RatingsRow';
import {Price} from '../Price';

type BookCardProps = {
  item: BookCardRecord,
  withDescription?: boolean,
};

export const BookCard = (
  {
    withDescription,
    item: {
      lowestPrice,
      highestPrice,
      avgRating,
      totalRatings,
      authors,
      primaryRelease,
    },
  }: BookCardProps,
) => {
  const t = useI18n();

  return (
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

      <div className='c-book-card__info'>
        <h3 className='c-book-card__title is-text-semibold is-text-small has-double-link-chevron'>
          {primaryRelease.title}
        </h3>

        <div className='c-book-card__author'>
          {R.pluck('name', authors).join(', ')}
        </div>
      </div>

      <div className='c-book-card__price'>
        <span className='is-text-muted is-text-small'>
          {`${t('shared.book.price')}:`}
        </span>

        <Price
          className='ml-1 is-text-primary is-text-semibold'
          value={lowestPrice}
        />

        {highestPrice > 0 && highestPrice !== lowestPrice && (
          <Price
            className='ml-1 is-text-muted is-text-strike is-text-small'
            value={highestPrice}
          />
        )}
      </div>
    </article>
  );
};

BookCard.displayName = 'BookCard';
