import React from 'react';
import * as R from 'ramda';

import {useInputLink} from '@client/hooks';

import {APIQuery} from '@client/modules/api/client/components';
import {FiltersContainer} from '@client/containers/filters';
import {BookCardRecord} from '@api/types';
import {BooksPaginationResultWithAggs} from '@api/repo';
import {ArrowsPagination} from '@client/containers/controls/pagination/ArrowsPagination';

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
      initialData: {
        limit: BOOKS_FILTERS_CONTAINER_BOOKS_COUNT,
      },
      effectFn(prevValue, value) {
        if (prevValue?.meta !== value?.meta)
          return value;

        return R.omit(['meta'], value);
      },
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
          serializeAggsToSearchParams(l.value),
        )
      }
      ignoreFirstRenderFetch
    >
      {({result, loading}) => {
        const safeResult = result ?? initialBooks;

        return (
          <FiltersContainer
            loading={loading}
            className='c-books-filters-section'
            sidebar={(
              <BooksFiltersGroups
                aggs={safeResult.aggs}
                l={l}
              />
            )}
            toolbarRenderFn={
              () => (
                <ArrowsPagination
                  {...l.input(
                    'meta',
                    {
                      defaultValue: safeResult.meta,
                    },
                  )}
                />
              )
            }
          >
            <BooksGrid
              items={
                safeResult.items as BookCardRecord[]
              }
              columns={{
                xs: 2,
                default: 6,
              }}
            />
          </FiltersContainer>
        );
      }}
    </APIQuery>
  );
};

BooksFiltersContainer.displayName = 'BooksFiltersContainer';
