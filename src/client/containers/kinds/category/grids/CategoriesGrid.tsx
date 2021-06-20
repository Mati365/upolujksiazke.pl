import React, {memo} from 'react';
import c from 'classnames';
import * as R from 'ramda';

import {useUA} from '@client/modules/ua';

import {
  ExpandableFooterContainer,
  Grid,
  GridProps,
} from '@client/components/ui';

import {BookCategoryRecord} from '@api/types';
import {
  CategoryCard,
  CategoryListItemCard,
} from '../cards';

type CategoriesGridProps = GridProps & {
  items: BookCategoryRecord[],
  allowExpand?: boolean,
};

export const CategoriesGrid = memo<CategoriesGridProps>(
  (
    {
      items,
      className,
      allowExpand = true,
      ...props
    },
  ) => {
    const ua = useUA();
    const CardComponent = (
      ua.mobile
        ? CategoryListItemCard
        : CategoryCard
    );

    const renderContent = (limit: number) => R.take(limit, items).map(
      (book) => (
        <CardComponent
          key={book.id}
          item={book}
        />
      ),
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
        {(
          allowExpand && ua.mobile
            ? (
              <ExpandableFooterContainer>
                {(toggled) => renderContent(toggled ? Infinity : 7)}
              </ExpandableFooterContainer>
            )
            : renderContent(Infinity)
        )}
      </Grid>
    );
  },
  (prevProps, props) => prevProps.items === props.items,
);

CategoriesGrid.displayName = 'CategoriesGrid';
