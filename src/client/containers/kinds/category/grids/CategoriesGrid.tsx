import React, {memo} from 'react';
import c from 'classnames';

import {Grid, GridProps} from '@client/components/ui';
import {BookCategoryRecord} from '@api/types';
import {CategoryCard} from '../cards/CategoryCard';

type CategoriesGridProps = GridProps & {
  items: BookCategoryRecord[],
};

export const CategoriesGrid = memo<CategoriesGridProps>(
  ({items, className, ...props}) => (
    <Grid
      columns={{
        default: 8,
        xs: 2,
      }}
      {...props}
      className={c(
        'c-books-grid',
        className,
      )}
    >
      {items.map(
        (book) => (
          <CategoryCard
            key={book.id}
            item={book}
          />
        ),
      )}
    </Grid>
  ),
  (prevProps, props) => prevProps.items === props.items,
);

CategoriesGrid.displayName = 'CategoriesGrid';
