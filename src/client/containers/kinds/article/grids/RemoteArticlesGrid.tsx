import React from 'react';
import c from 'classnames';

import {Grid, GridProps} from '@client/components/ui';
import {RemoteArticleRecord} from '@api/types';

import {RemoteArticleCard} from '../cards/RemoteArticleCard';

type BooksGridProps = GridProps & {
  items: RemoteArticleRecord[],
};

export const RemoteArticlesGrid = ({items, className, ...props}: BooksGridProps) => (
  <Grid
    {...props}
    className={c(
      'c-remote-articles-grid',
      className,
    )}
  >
    {items.map(
      (item) => (
        <RemoteArticleCard
          key={item.id}
          item={item}
        />
      ),
    )}
  </Grid>
);

RemoteArticlesGrid.displayName = 'RemoteArticlesGrid';
