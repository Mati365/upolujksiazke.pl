import React, {memo} from 'react';
import c from 'classnames';

import {ViewMode} from '@shared/enums';

import {Grid, GridProps} from '@client/components/ui';
import {BookCardRecord} from '@api/types';
import {BookCard} from '../cards/BookCard';

export const GRID_VIEW_MODE_CARDS: Record<ViewMode, any> = {
  [ViewMode.GRID]: BookCard,
  [ViewMode.LIST]: BookCard,
};

type BooksGridProps = GridProps & {
  items: BookCardRecord[],
  viewMode?: ViewMode,
};

export const BooksGrid = memo<BooksGridProps>(
  (
    {
      items,
      className,
      viewMode,
      ...props
    },
  ) => {
    const CardComponent = GRID_VIEW_MODE_CARDS[viewMode ?? ViewMode.GRID];

    return (
      <Grid
        {...props}
        viewMode={viewMode}
        className={c(
          'c-books-grid',
          className,
        )}
      >
        {items.map(
          (book) => (
            <CardComponent
              key={book.id}
              item={book}
            />
          ),
        )}
      </Grid>
    );
  },
  (prevProps, props) => (
    prevProps.items === props.items
      && prevProps.viewMode === props.viewMode
  ),
);

BooksGrid.displayName = 'BooksGrid';
