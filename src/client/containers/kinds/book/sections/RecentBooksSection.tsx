import React from 'react';

import {useI18n} from '@client/i18n';

import {Section} from '@client/components/ui';
import {SortMode} from '@shared/enums';
import {BookCardRecord} from '@api/types/BookCard.record';
import {BooksLink} from '@client/routes/Links';
import {BooksGrid} from '../grids/BooksGrid';

type RecentBooksSectionProps = {
  items: BookCardRecord[],
};

export const RecentBooksSection = ({items}: RecentBooksSectionProps) => {
  const t = useI18n();

  return (
    <Section
      headerClassName='has-double-link-chevron'
      title={(
        <BooksLink
          hoverUnderline={false}
          item={{
            sort: SortMode.RECENTLY_ADDED,
          }}
        >
          {t('sections.recent_books.title')}
        </BooksLink>
      )}
    >
      <BooksGrid items={items} />
    </Section>
  );
};

RecentBooksSection.displayName = 'RecentBooksSection';
