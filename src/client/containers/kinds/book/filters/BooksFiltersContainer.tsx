import React, {useMemo} from 'react';
import * as R from 'ramda';

import {
  useInputLink,
  usePrevious,
  useUpdateEffect,
} from '@client/hooks';

import {
  pickNonPaginationFilters,
  useStoreFiltersInURL,
} from '@client/containers/filters/hooks/useStoreFiltersInURL';

import {FiltersBadges} from '@client/containers/filters/FiltersBadges';
import {APIQuery} from '@client/modules/api/client/components';
import {FiltersContainer} from '@client/containers/filters';
import {BookCardRecord} from '@api/types';
import {BooksPaginationResultWithAggs} from '@api/repo';
import {ArrowsPagination} from '@client/containers/controls/pagination/ArrowsPagination';

import {BooksGrid} from '../grids';
import {BooksFiltersGroups} from './BooksFiltersGroups';

import {serializeAggsToSearchParams} from './helpers/serializeAggsToSearchParams';

export function getDefaultBooksFilters() {
  return {
    offset: 0,
    limit: 30,
  };
}

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
      initialData: decodedInitialFilters || getDefaultBooksFilters(),
      effectFn(prevValue, value) {
        if (prevValue?.offset !== value?.offset)
          return value;

        return {
          ...value,
          offset: 0,
        };
      },
    },
  );

  const prevValue = usePrevious(l.value);
  const {emptyFilters, serializedValue} = useMemo(
    () => ({
      emptyFilters: R.isEmpty(pickNonPaginationFilters(l.value)),
      serializedValue: serializeAggsToSearchParams(l.value),
    }),
    [l.value],
  );

  useUpdateEffect(
    () => {
      assignFiltersToURL(l.value);
    },
    [l.value],
  );

  return (
    <APIQuery<BooksPaginationResultWithAggs>
      initialInstant
      debounce={(
        prevValue?.phrase !== l.value?.phrase
          ? 300
          : null
      )}
      loadingComponent={null}
      promiseKey={serializedValue}
      promiseFn={
        ({api}) => api.repo.books.findAggregatedBooks(serializedValue)
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
              (top) => (
                <>
                  {top && (
                    <FiltersBadges
                      {...l.input()}
                      translationsPath='book.filters'
                    />
                  )}
                  <ArrowsPagination
                    totalItems={safeResult.meta.totalItems}
                    {...l.input()}
                  />
                </>
              )
            }
            {...!emptyFilters && {
              onClearFilters: () => l.setValue({}),
            }}
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
