import React, {memo} from 'react';
import c from 'classnames';

import {useUA} from '@client/modules/ua';

import {Grid, GridProps} from '@client/components/ui';
import {BookCategoryRecord} from '@api/types';
import {
  CategoryCard,
  CategoryListItemCard,
} from '../cards';

type CategoriesGridProps = GridProps & {
  items: BookCategoryRecord[],
};

export const CategoriesGrid = memo<CategoriesGridProps>(
  ({items, className, ...props}) => {
    const ua = useUA();
    const CardComponent = (
      ua.mobile
        ? CategoryListItemCard
        : CategoryCard
    );

    return (
      <Grid
        columns={{
          default: 8,
          xs: 1,
        }}
        {...props}
        className={c(
          'c-categories-grid',
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
  (prevProps, props) => prevProps.items === props.items,
);

CategoriesGrid.displayName = 'CategoriesGrid';
