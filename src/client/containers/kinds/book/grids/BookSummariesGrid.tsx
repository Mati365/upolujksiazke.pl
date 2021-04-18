import React, {useMemo} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {Grid, GridProps} from '@client/components/ui';
import {BookSummaryRecord} from '@api/types';
import {BookSummaryCard} from '../cards/BookSummaryCard';

type BookSummariesGridProps = GridProps & {
  items: BookSummaryRecord[],
};

export const BookSummariesGrid = ({items, className, ...props}: BookSummariesGridProps) => {
  const sortedItems = useMemo(
    () => R.sortBy(
      ({article, headers}) => (+!!article.cover?.preview) * (-headers?.length || 0),
      items,
    ),
    [items],
  );

  return (
    <Grid
      {...props}
      className={c(
        'c-book-summaries-grid',
        className,
      )}
    >
      {sortedItems.map(
        (item, index) => (
          <BookSummaryCard
            key={item.id}
            item={item}
            showCover={index < 2}
          />
        ),
      )}
    </Grid>
  );
};

BookSummariesGrid.displayName = 'BookSummariesGrid';
