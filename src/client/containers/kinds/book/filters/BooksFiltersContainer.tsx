import React from 'react';

import {FiltersContainer} from '@client/containers/filters';
import {BookCardRecord} from '@api/types';
import {BooksPaginationResultWithAggs} from '@api/repo';
import {BooksGrid} from '../grids';
import {BooksFiltersGroups} from './BooksFiltersGroups';

type BooksFiltersContainerProps = {
  initialBooks: BooksPaginationResultWithAggs,
};

export const BooksFiltersContainer = ({initialBooks}: BooksFiltersContainerProps) => (
  <FiltersContainer
    className='c-books-filters-section'
    sidebar={(
      <BooksFiltersGroups aggs={initialBooks.aggs} />
    )}
  >
    <BooksGrid
      items={
        initialBooks.items as BookCardRecord[]
      }
      columns={{
        xs: 2,
        default: 6,
      }}
    />
  </FiltersContainer>
);

BooksFiltersContainer.displayName = 'BooksFiltersContainer';
