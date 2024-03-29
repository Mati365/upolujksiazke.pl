import React, {memo} from 'react';
import c from 'classnames';

import {useUA} from '@client/modules/ua';

import {ViewMode} from '@shared/enums';
import {Grid, GridProps} from '@client/components/ui';
import {BookCardRecord} from '@api/types';
import {
  BookCard,
  WideBookCard,
} from '../cards';

export const GRID_VIEW_MODE_CARDS: Record<ViewMode, any> = {
  [ViewMode.GRID]: BookCard,
  [ViewMode.LIST]: WideBookCard,
};

export type BooksGridProps = GridProps & {
  items: BookCardRecord[],
  cardComponent?: any,
  viewMode?: ViewMode,
};

export const BooksGrid = memo<BooksGridProps>(
  (
    {
      cardComponent,
      items,
      className,
      viewMode,
      ...props
    },
  ) => {
    const ua = useUA();
    const CardComponent = cardComponent ?? (
      ua.mobile
        ? WideBookCard
        : GRID_VIEW_MODE_CARDS[viewMode ?? ViewMode.GRID]
    );

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
              {...ua.mobile && {
                withDescription: false,
                totalRatingStars: 6,
              }}
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
