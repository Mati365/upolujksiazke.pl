import React from 'react';

import {useI18n} from '@client/i18n';
import {Grid, SidebarSection} from '@client/components/ui';
import {BookAuthorRecord, BookCardRecord} from '@api/types';
import {BookThumbCard} from '../../../../cards/BookThumbCard';

type AuthorOtherBooksProps = {
  books: BookCardRecord[],
  author: BookAuthorRecord,
};

export const AuthorOtherBooks = ({books, author}: AuthorOtherBooksProps) => {
  const t = useI18n();

  return (
    <SidebarSection
      title={
        `${t('author.other_books', [author.name])}:`
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

AuthorOtherBooks.displayName = 'AuthorOtherBooks';
