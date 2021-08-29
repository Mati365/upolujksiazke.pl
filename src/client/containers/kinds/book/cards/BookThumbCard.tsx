import React from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {RatingsRow} from '@client/containers/controls/RatingsRow';
import {BookCardRecord} from '@api/types';
import {BookLink} from '@client/routes/Links';
import {BookCover} from './BookCard/BookCover';

export type BookThumbCardProps = {
  item: BookCardRecord,
  titled?: boolean,
  rated?: boolean,
  className?: string,
};

export const BookThumbCard = (
  {
    className,
    item,
    titled = true,
    rated = true,
  }: BookThumbCardProps,
) => {
  const t = useI18n();
  const formattedTitle = formatBookTitle(
    {
      t,
      book: item,
    },
  );

  return (
    <article
      className={c(
        'c-book-thumb-card',
        className,
      )}
    >
      <BookLink item={item}>
        <BookCover
          className='c-book-thumb-card__cover is-hover-scale'
          alt={formattedTitle}
          book={item}
        />

        {rated && (
          <RatingsRow
            className='c-book-thumb-card__ratings'
            value={item.avgRating / 10}
          />
        )}

        {titled && (
          <div className='c-book-thumb-card__title'>
            {formattedTitle}
          </div>
        )}
      </BookLink>
    </article>
  );
};

BookThumbCard.displayName = 'BookThumbCard';
