import React from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {getBookRibbons} from '@client/helpers/logic';

import {Picture} from '@client/components/ui';
import {BookCardRecord, ImageVersionField} from '@api/types';
import {BookRibons} from './BookRibbons';

type BookCoverProps = {
  book: BookCardRecord,
  className?: string,
  forceRatio?: boolean,
  alt?: string,
  version?: ImageVersionField,
};

export const BookCover = (
  {
    className,
    alt,
    book,
    forceRatio = true,
    version = 'preview',
  }: BookCoverProps,
) => {
  const t = useI18n();

  return (
    <Picture
      className={c(
        'c-book-cover',
        forceRatio && 'has-forced-ratio',
        className,
      )}
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
