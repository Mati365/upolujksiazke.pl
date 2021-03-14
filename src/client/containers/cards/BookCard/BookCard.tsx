import React from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {getBookRibbons} from '@client/helpers/logic';

import {BookCardRecord} from '@api/types';
import {Picture} from '@client/components/ui';
import {BookLink} from '@client/routes/Links';

import {RatingsRow} from '../../parts/RatingsRow';
import {BookTypesRow} from './BookTypesRow';
import {BookPriceRow} from './BookPriceRow';
import {BookActionRow} from './BookActionsRow';
import {BookRibons} from './BookRibbons';

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
    primaryRelease,
  } = item;

  return (
    <article
      className={c(
        'c-book-card',
        withDescription && 'has-description',
      )}
    >
      <BookLink item={item}>
        <Picture
          className='c-book-card__cover'
          alt={primaryRelease.title}
          src={primaryRelease.cover.preview.file}
          layer={(
            <BookRibons
              items={getBookRibbons(
                {
                  t,
                  book: item,
                },
              )}
            />
          )}
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
            {primaryRelease.title}
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
