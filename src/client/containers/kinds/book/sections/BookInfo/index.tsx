import React from 'react';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {RatingsRow} from '@client/containers/parts/RatingsRow';
import {BookFullInfoRecord} from '@api/types';
import {
  ExpandableDescriptionBox,
  Divider,
  Section,
} from '@client/components/ui';

import {BookAuthorsRow} from '../../cards/BookCard/BookAuthorsRow';
import {BookCover} from '../../cards/BookCard/BookCover';
import {BookPriceBox} from './BookPriceBox';
import {BookProperties} from './BookProperties';
import {BookHeaderAttribute} from './BookHeaderAttribute';

type BookInfoProps = {
  book: BookFullInfoRecord,
};

export const BookInfo = ({book}: BookInfoProps) => {
  const t = useI18n();
  const {
    primaryRelease, authors,
    avgRating, totalRatings,
  } = book;

  const formattedTitle = formatBookTitle(
    {
      t,
      book,
    },
  );

  return (
    <Section
      spaced={3}
      className='c-book-info-section'
    >
      <div className='c-book-info-section__cover'>
        <BookCover
          alt={formattedTitle}
          book={book}
          forceRatio={false}
        />
      </div>

      <div className='c-book-info-section__info'>
        <h1 className='c-book-info-section__header'>
          {formattedTitle}
        </h1>

        <BookHeaderAttribute
          className='c-book-info-section__author'
          label={
            `${t('book.created_by')}:`
          }
        >
          <BookAuthorsRow
            authors={authors}
            linkProps={{
              underline: true,
            }}
            block={false}
            separated
          />
        </BookHeaderAttribute>

        <BookHeaderAttribute
          className='c-book-info-section__ratings'
          label={
            `${t('shared.titles.rating')}:`
          }
        >
          <RatingsRow
            size='big'
            value={avgRating / 10}
            totalStars={10}
            totalRatings={totalRatings}
          />
        </BookHeaderAttribute>

        <ExpandableDescriptionBox
          maxCharactersCount={900}
          text={
            primaryRelease.description || t('book.no_description')
          }
        />

        <Divider />

        <BookProperties book={book} />
      </div>

      <BookPriceBox book={book} />
    </Section>
  );
};

BookInfo.displayName = 'BookInfo';
