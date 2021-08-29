import React from 'react';

import {useI18n} from '@client/i18n';

import {Section, SectionMore, SectionProps} from '@client/components/ui';
import {BookReviewRecord} from '@api/types';
import {BooksReviewsLink} from '@client/routes/Links';
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
      <SectionMore tag={BooksReviewsLink} />
    </Section>
  );
};

RecentlyCommendedBooks.displayName = 'RecentlyCommendedBooks';
