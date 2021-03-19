import React from 'react';

import {useI18n} from '@client/i18n';
import {formatBookTitle} from '@client/helpers/logic';

import {BookFullInfoRecord} from '@api/types';
import {BookAuthorsRow} from '@client/containers/cards/BookCard/BookAuthorsRow';
import {BookCover} from '@client/containers/cards/BookCard/BookCover';
import {
  DescriptionBox,
  Section,
} from '@client/components/ui';

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
        />
      </div>

      <div className='c-book-info-section__info'>
        <h1 className='c-book-info-section__header'>
          {formattedTitle}
        </h1>

        <div className='c-book-info-section__author'>
          {`${t('book.created_by')}:`}
          <BookAuthorsRow
            className='ml-1'
            block={false}
            authors={authors}
            linkProps={{
              underline: true,
            }}
          />
        </div>

        <DescriptionBox
          dangerouslySetInnerHTML={{
            __html: primaryRelease.description,
          }}
        />
      </div>
    </Section>
  );
};

BookInfo.displayName = 'BookInfo';
