import React from 'react';
import c from 'classnames';

import {Grid, GridProps} from '@client/components/ui';
import {BookSummaryRecord} from '@api/types';
import {BookSummaryCard} from '../cards/BookSummaryCard';

type BookSummariesGridProps = GridProps & {
  items: BookSummaryRecord[],
};

export const BookSummariesGrid = ({items, className, ...props}: BookSummariesGridProps) => (
  <Grid
    {...props}
    className={c(
      'c-book-summaries-grid',
      className,
    )}
  >
    {items.map(
      (item) => (
        <BookSummaryCard
          key={item.id}
          item={item}
        />
      ),
    )}
  </Grid>
);

BookSummariesGrid.displayName = 'BookSummariesGrid';
