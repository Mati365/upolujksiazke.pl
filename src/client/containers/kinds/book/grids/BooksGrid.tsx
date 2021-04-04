import React from 'react';
import c from 'classnames';

import {Grid, GridProps} from '@client/components/ui';
import {BookCardRecord} from '@api/types';
import {BookCard} from '../cards/BookCard';

type BooksGridProps = GridProps & {
  items: BookCardRecord[],
};

export const BooksGrid = ({items, className, ...props}: BooksGridProps) => (
  <Grid
    {...props}
    className={c(
      'c-books-grid',
      className,
    )}
  >
    {items.map(
      (book) => (
        <BookCard
          key={book.id}
          item={book}
        />
      ),
    )}
  </Grid>
);

BooksGrid.displayName = 'BooksGrid';
