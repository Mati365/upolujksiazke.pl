import React from 'react';

import {useI18n} from '@client/i18n';

import {BookReviewRecord} from '@api/types';
import {Section, SectionProps} from '@client/components/ui';
import {BooksReviewsGrid} from '../grids/BooksReviewsGrid';

type RecentlyCommendedBooksProps = SectionProps & {
  items: BookReviewRecord[],
};

export const RecentlyCommendedBooks = (
  {
    items,
    ...props
  }: RecentlyCommendedBooksProps,
) => {
  const t = useI18n('sections.recently_commented_books');

  return (
    <Section
      title={
        t('title')
      }
      {...props}
    >
      <BooksReviewsGrid items={items} />
    </Section>
  );
};

RecentlyCommendedBooks.displayName = 'RecentlyCommendedBooks';
