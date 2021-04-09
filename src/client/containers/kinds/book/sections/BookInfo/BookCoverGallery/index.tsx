import React, {useState} from 'react';
import c from 'classnames';

import {useI18n} from '@client/i18n';
import {formatReleaseTitle} from '@client/helpers/logic';

import {BookFullInfoRecord} from '@api/types';
import {BookCover} from '../../../cards/BookCard/BookCover';
import {BookGalleryThumbs, BookGalleryThumb} from './BookGalleryThumbs';

type BookCoverGalleryProps = {
  book: BookFullInfoRecord,
  primaryAlt?: string,
  className?: string,
  tag?: any,
};

export const BookCoverGallery = (
  {
    tag: Tag = 'div',
    book,
    className,
    primaryAlt,
  }: BookCoverGalleryProps,
) => {
  const t = useI18n();
  const primaryReleaseCover = book.primaryRelease.cover?.preview?.file;

  const [thumb, setFocusedThumb] = useState<BookGalleryThumb>();
  const thumbs: BookGalleryThumb[] = (
    book.releases
      .map(
        (release) => {
          const {cover, title} = release;
          const src = cover?.thumb?.file;
          if (!src)
            return null;

          return {
            src,
            expandSrc: cover?.preview?.file,
            alt: title,
            title: formatReleaseTitle(
              {
                t,
                book,
                release,
              },
            ),
          };
        },
      )
      .filter(Boolean)
      .sort(
        (a, b) => (+(b.expandSrc === primaryReleaseCover) - +(a.expandSrc === primaryReleaseCover)),
      )
  );

  const src = thumb?.expandSrc ?? primaryReleaseCover;
  return (
    <Tag
      className={c(
        'c-book-gallery',
        className,
      )}
    >
      <BookCover
        src={src}
        alt={primaryAlt}
        book={book}
        align='top'
        forceRatio
        forceExpand
      />

      {thumbs.length > 0 && (
        <BookGalleryThumbs
          active={src}
          items={thumbs}
          onClick={setFocusedThumb}
        />
      )}
    </Tag>
  );
};

BookCoverGallery.displayName = 'BookCoverGallery';
