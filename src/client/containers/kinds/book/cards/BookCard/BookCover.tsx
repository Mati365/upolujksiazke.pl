import React from 'react';
import c from 'classnames';

import noBookCoverPlaceholderUrl from '@assets/img/no-book-cover-placeholder.png';

import {useI18n} from '@client/i18n';
import {getBookRibbons} from '@client/helpers/logic';

import {Picture} from '@client/components/ui';
import {BookCardRecord, ImageVersionField} from '@api/types';
import {BookRibons} from './BookRibbons';

type BookCoverProps = {
  book: BookCardRecord,
  className?: string,
  forceRatio?: boolean,
  forceExpand?: boolean,
  alt?: string,
  src?: string,
  align?: string,
  version?: ImageVersionField,
};

export const BookCover = (
  {
    className,
    alt,
    src,
    book,
    align,
    forceRatio = true,
    forceExpand = false,
    version = 'preview',
  }: BookCoverProps,
) => {
  const t = useI18n();

  return (
    <Picture
      className={c(
        'c-book-cover',
        forceRatio && 'has-forced-ratio',
        forceExpand && 'has-forced-expand',
        align && `is-aligned-${align}`,
        className,
      )}
      alt={alt}
      src={(
        src
          ?? book.primaryRelease.cover[version]?.file
          ?? noBookCoverPlaceholderUrl
      )}
      layer={(
        <BookRibons
          align={align}
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
