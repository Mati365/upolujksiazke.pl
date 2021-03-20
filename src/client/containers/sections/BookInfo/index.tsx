import React from 'react';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {BookFullInfoRecord} from '@api/types';
import {BookAuthorsRow} from '@client/containers/cards/BookCard/BookAuthorsRow';
import {BookCover} from '@client/containers/cards/BookCard/BookCover';
import {
  ExpandableDescriptionBox,
  Section,
} from '@client/components/ui';

import {BookPriceBox} from './BookPriceBox';

type BookInfoProps = {
  book: BookFullInfoRecord,
};

export const BookInfo = ({book}: BookInfoProps) => {
  const t = useI18n();
  const {primaryRelease, authors} = book;
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

        <div className='c-book-info-section__author'>
          {`${t('book.created_by')}:`}
          <BookAuthorsRow
            block={false}
            className='ml-1'
            authors={authors}
            linkProps={{
              underline: true,
            }}
          />
        </div>

        <ExpandableDescriptionBox
          maxCharactersCount={900}
          text={primaryRelease.description}
        />
      </div>

      <BookPriceBox book={book} />
    </Section>
  );
};

BookInfo.displayName = 'BookInfo';
