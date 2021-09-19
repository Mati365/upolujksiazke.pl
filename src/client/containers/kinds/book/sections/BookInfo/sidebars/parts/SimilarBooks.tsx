import React from 'react';

import {useI18n} from '@client/i18n';
import {
  Grid,
  SidebarSection,
  SidebarSectionProps,
} from '@client/components/ui';

import {BookCardRecord} from '@api/types';
import {BookThumbCard} from '../../../../cards/BookThumbCard';

type SimilarBooksProps = SidebarSectionProps & {
  books: BookCardRecord[],
};

export const SimilarBooks = ({books, ...props}: SimilarBooksProps) => {
  const t = useI18n();

  return (
    <SidebarSection
      title={
        `${t('book.similar_books')}:`
      }
      {...props}
    >
      <Grid
        columns={{
          default: 2,
        }}
        gap={3}
      >
        {books.map(
          (item) => (
            <BookThumbCard
              key={item.id}
              item={item}
            />
          ),
        )}
      </Grid>
    </SidebarSection>
  );
};

SimilarBooks.displayName = 'SimilarBooks';
