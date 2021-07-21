import React from 'react';

import {useI18n} from '@client/i18n';

import {Section, SectionMore, SectionProps} from '@client/components/ui';
import {SortMode} from '@shared/enums';
import {BookCardRecord} from '@api/types/BookCard.record';
import {BooksLink} from '@client/routes/Links';
import {BooksGrid, BooksGridProps} from '../grids/BooksGrid';

type RecentBooksSectionProps = {
  items: BookCardRecord[],
  gridProps?: Omit<BooksGridProps, 'items'>,
  sectionProps?: SectionProps,
};

export const RecentBooksSection = (
  {
    items,
    gridProps,
    sectionProps,
  }: RecentBooksSectionProps,
) => {
  const t = useI18n();

  return (
    <Section
      title={(
        <BooksLink
          className='has-double-link-chevron'
          hoverUnderline={false}
          item={{
            sort: SortMode.RECENTLY_ADDED,
          }}
        >
          {t('sections.recent_books.title')}
        </BooksLink>
      )}
      {...sectionProps}
    >
      <BooksGrid
        items={items}
        {...gridProps}
      />

      <SectionMore
        tag={BooksLink}
        item={{
          sort: SortMode.RECENTLY_ADDED,
        }}
      />
    </Section>
  );
};

RecentBooksSection.displayName = 'RecentBooksSection';
