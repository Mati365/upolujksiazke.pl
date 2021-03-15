import React from 'react';

import {useI18n} from '@client/i18n';
import {getBookRibbons} from '@client/helpers/logic';

import {Picture} from '@client/components/ui';
import {BookCardRecord, ImageVersionField} from '@api/types';
import {BookRibons} from './BookRibbons';

type BookCoverProps = {
  book: BookCardRecord,
  alt?: string,
  version?: ImageVersionField,
};

export const BookCover = (
  {
    alt,
    book,
    version = 'preview',
  }: BookCoverProps,
) => {
  const t = useI18n();

  return (
    <Picture
      className='c-book-cover'
      alt={alt}
      src={book.primaryRelease.cover[version].file}
      layer={(
        <BookRibons
          items={getBookRibbons(
            {
              t,
              book,
            },
          )}
        />
      )}
    />
  );
};

BookCover.displayName = 'BookCover';
