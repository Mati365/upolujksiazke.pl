import React from 'react';

import {FiltersContainer} from '@client/containers/filters';
import {BookCardRecord} from '@api/types';
import {BooksGrid} from '../grids';
import {BooksFiltersGroups} from './BooksFiltersGroups';

type BooksFiltersContainerProps = {
  initialBooks: BookCardRecord[],
};

export const BooksFiltersContainer = ({initialBooks}: BooksFiltersContainerProps) => (
  <FiltersContainer
    className='c-books-filters-section'
    sidebar={(
      <BooksFiltersGroups />
    )}
  >
    <BooksGrid
      items={initialBooks}
      columns={{
        xs: 2,
        default: 6,
      }}
    />
  </FiltersContainer>
);

BooksFiltersContainer.displayName = 'BooksFiltersContainer';
