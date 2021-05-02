import React, {memo} from 'react';
import c from 'classnames';

import {Grid, GridProps} from '@client/components/ui';
import {BookCardRecord} from '@api/types';
import {BookCard} from '../cards/BookCard';

type BooksGridProps = GridProps & {
  items: BookCardRecord[],
};

export const BooksGrid = memo<BooksGridProps>(
  ({items, className, ...props}) => (
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
  ),
  (prevProps, props) => prevProps.items === props.items,
);

BooksGrid.displayName = 'BooksGrid';
