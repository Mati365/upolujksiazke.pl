import React from 'react';

import {useI18n} from '@client/i18n';

import {Section} from '@client/components/ui';
import {BookCardRecord} from '@api/types/BookCard.record';
import {BooksGrid} from '../grids/BooksGrid';

type RecentBooksSectionProps = {
  items: BookCardRecord[],
};

export const RecentBooksSection = ({items}: RecentBooksSectionProps) => {
  const t = useI18n();

  return (
    <Section
      headerClassName='has-double-link-chevron'
      title={
        t('sections.recent_books.title')
      }
    >
      <BooksGrid items={items} />
    </Section>
  );
};

RecentBooksSection.displayName = 'RecentBooksSection';
