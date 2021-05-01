import React from 'react';

import {useInputLink} from '@client/hooks';

import {APIQuery} from '@client/modules/api/client/components';
import {FiltersContainer} from '@client/containers/filters';
import {BookCardRecord} from '@api/types';
import {BooksPaginationResultWithAggs} from '@api/repo';

import {BooksGrid} from '../grids';
import {BooksFiltersGroups} from './BooksFiltersGroups';

import {serializeAggsToSearchParams} from './helpers/serializeAggsToSearchParams';

export const BOOKS_FILTERS_CONTAINER_BOOKS_COUNT = 30;

type BooksFiltersContainerProps = {
  initialBooks: BooksPaginationResultWithAggs,
};

export const BooksFiltersContainer = ({initialBooks}: BooksFiltersContainerProps) => {
  const l = useInputLink<any>(
    {
      initialData: {},
    },
  );

  return (
    <APIQuery<BooksPaginationResultWithAggs>
      loadingComponent={null}
      promiseKey={
        JSON.stringify(l.value)
      }
      promiseFn={
        ({api}) => api.repo.books.findAggregatedBooks(
          {
            ...serializeAggsToSearchParams(l.value),
            limit: BOOKS_FILTERS_CONTAINER_BOOKS_COUNT,
          },
        )
      }
      ignoreFirstRenderFetch
    >
      {({result, loading}) => (
        <FiltersContainer
          loading={loading}
          className='c-books-filters-section'
          sidebar={(
            <BooksFiltersGroups
              aggs={
                result?.aggs ?? initialBooks.aggs
              }
              l={l}
            />
          )}
        >
          <BooksGrid
            items={
              (result?.items ?? initialBooks.items) as BookCardRecord[]
            }
            columns={{
              xs: 2,
              default: 6,
            }}
          />
        </FiltersContainer>
      )}
    </APIQuery>
  );
};

BooksFiltersContainer.displayName = 'BooksFiltersContainer';
