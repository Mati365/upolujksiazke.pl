import React from 'react';

import {useI18n} from '@client/i18n';
import {Grid, SidebarSection} from '@client/components/ui';
import {BookCardRecord} from '@api/types';
import {BookThumbCard} from '../../../../cards/BookThumbCard';

type SimilarBooksProps = {
  books: BookCardRecord[],
};

export const SimilarBooks = ({books}: SimilarBooksProps) => {
  const t = useI18n();

  return (
    <SidebarSection
      title={
        `${t('book.similar_books')}:`
      }
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
