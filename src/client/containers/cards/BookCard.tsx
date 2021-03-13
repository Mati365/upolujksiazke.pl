import React from 'react';
import c from 'classnames';

import {BookCardRecord} from '@api/types';
import {Picture} from '@client/components/ui';

type BookCardProps = {
  item: BookCardRecord,
  withDescription?: boolean,
};

export const BookCard = (
  {
    withDescription,
    item: {
      primaryRelease,
    },
  }: BookCardProps,
) => (
  <article
    className={c(
      'c-book-card',
      withDescription && 'has-description',
    )}
  >
    <Picture
      className='c-book-card__cover'
      alt={primaryRelease.title}
      src={primaryRelease.cover.preview.file}
    />
  </article>
);

BookCard.displayName = 'BookCard';
