import React from 'react';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {BookFullInfoRecord} from '@api/types';
import {BookCover} from '@client/containers/cards/BookCard/BookCover';
import {Section} from '@client/components/ui';

type BookInfoProps = {
  book: BookFullInfoRecord,
};

export const BookInfo = ({book}: BookInfoProps) => {
  const t = useI18n();
  const {primaryRelease} = book;
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
        />
      </div>

      <Section
        title={formattedTitle}
        className='c-book-info-section__info'
        contentClassName='c-description-box'
        spaced={0}
      >
        {primaryRelease.description}
      </Section>
    </Section>
  );
};

BookInfo.displayName = 'BookInfo';
