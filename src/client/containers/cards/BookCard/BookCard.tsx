import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {BookCardRecord} from '@api/types';
import {BookLink} from '@client/routes/Links';

import {RatingsRow} from '../../parts/RatingsRow';
import {BookTypesRow} from './BookTypesRow';
import {BookPriceRow} from './BookPriceRow';
import {BookActionRow} from './BookActionsRow';
import {BookCover} from './BookCover';

type BookCardProps = {
  item: BookCardRecord,
  withDescription?: boolean,
};

export const BookCard = (
  {
    withDescription,
    item,
  }: BookCardProps,
) => {
  const t = useI18n();
  const {
    allTypes,
    lowestPrice,
    highestPrice,
    avgRating,
    totalRatings,
    authors,
  } = item;

  const formattedTitle = formatBookTitle(
    {
      t,
      book: item,
    },
  );

  return (
    <article
      className={c(
        'c-book-card',
        withDescription && 'has-description',
      )}
    >
      <BookLink item={item}>
        <BookCover
          alt={formattedTitle}
          book={item}
        />
      </BookLink>

      <RatingsRow
        className='c-book-card__ratings'
        value={avgRating / 10}
        totalReviews={totalRatings}
      />

      <div className='c-book-card__info'>
        <BookLink item={item}>
          <h3 className='c-book-card__title is-text-semibold is-text-small has-double-link-chevron'>
            {formattedTitle}
          </h3>
        </BookLink>

        <div className='c-book-card__author'>
          {R.pluck('name', authors).join(', ')}
        </div>
      </div>

      <BookTypesRow types={allTypes} />
      <BookPriceRow
        lowestPrice={lowestPrice}
        highestPrice={highestPrice}
      />

      <BookActionRow />
    </article>
  );
};

BookCard.displayName = 'BookCard';
