import React from 'react';
import * as R from 'ramda';

import {useInputLink, useUpdateEffect} from '@client/hooks';
import {useStoreFiltersInURL} from '@client/containers/filters/hooks/useStoreFiltersInURL';

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
  initialFilters?: any,
};

export const BooksFiltersContainer = ({initialBooks, initialFilters}: BooksFiltersContainerProps) => {
  const {
    decodedInitialFilters,
    assignFiltersToURL,
  } = useStoreFiltersInURL(
    {
      initialFilters,
    },
  );

  const l = useInputLink<any>(
    {
      initialData: decodedInitialFilters || {
        limit: BOOKS_FILTERS_CONTAINER_BOOKS_COUNT,
      },
      effectFn(prevValue, value) {
        if (prevValue?.meta !== value?.meta)
          return value;

        return R.omit(['meta'], value);
      },
    },
  );

  useUpdateEffect(
    () => {
      assignFiltersToURL(l.value);
    },
    [l.value],
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
                      assignValueParserFn: (val) => ({
                        ...safeResult.meta,
                        ...val,
                      }),
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
