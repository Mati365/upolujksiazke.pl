import React from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {RatingsRow} from '@client/containers/parts/RatingsRow';
import {ExpandableDescriptionBox, LinksRow} from '@client/components/ui';
import {
  AuthorLink,
  BookLink,
} from '@client/routes/Links';

import {BookTypesRow} from './BookCard/BookTypesRow';
import {BookPriceRow} from './BookCard/BookPriceRow';
import {BookCover} from './BookCard/BookCover';
import {BookCardProps} from './BookCard';

type WideBookCardProps = BookCardProps;

export const WideBookCard = ({item}: WideBookCardProps) => {
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
    <article className='c-book-card c-book-wide-card'>
      <BookLink item={item}>
        <BookCover
          className='c-book-wide-card__cover'
          alt={formattedTitle}
          book={item}
        />
      </BookLink>

      <div className='c-book-wide-card__basic-info'>
        <BookLink item={item}>
          <h3 className='c-book-card__title is-text-semibold is-text-small has-double-link-chevron'>
            {formattedTitle}
          </h3>
        </BookLink>

        <RatingsRow
          className='c-book-card__ratings'
          value={avgRating / 10}
          totalRatings={totalRatings}
          truncateRatingsCount={Infinity}
          totalStars={10}
        />

        <LinksRow
          className='c-book-card__author'
          linkComponent={AuthorLink}
          items={
            R.take(2, authors)
          }
          spaced={0}
          inline={false}
          block
        />

        <BookTypesRow types={allTypes} />
        <BookPriceRow
          lowestPrice={lowestPrice}
          highestPrice={highestPrice}
        />
      </div>

      <ExpandableDescriptionBox
        html
        className='c-book-wide-card__description'
        maxCharactersCount={600}
        text={(
          item.description
            || t('book.no_description')
        )}
        mobileSmaller={false}
        renderHiddenChunk={false}
        moreButtonRenderFn={
          ({expandTitle}) => (
            <BookLink
              className='c-promo-tag-link'
              undecorated={false}
              item={item}
              withChevron
            >
              {expandTitle}
            </BookLink>
          )
        }
      />
    </article>
  );
};

WideBookCard.displayName = 'WideBookCard';
