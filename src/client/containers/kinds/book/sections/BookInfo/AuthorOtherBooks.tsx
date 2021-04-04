import React from 'react';

import {useI18n} from '@client/i18n';
import {Grid, SidebarSection} from '@client/components/ui';
import {BookCardRecord} from '@api/types';
import {BookThumbCard} from '../../cards/BookThumbCard';

type AuthorOtherBooksProps = {
  books: BookCardRecord[],
};

export const AuthorOtherBooks = ({books}: AuthorOtherBooksProps) => {
  const t = useI18n();

  return (
    <SidebarSection
      className='c-book-info-section__releases'
      title={
        `${t('author.other_books')}:`
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
