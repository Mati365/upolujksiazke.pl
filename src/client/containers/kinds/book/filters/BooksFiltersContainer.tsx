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

import {APIQuery} from '@client/modules/api/client/components';
import {BookCardRecord} from '@api/types';
import {BooksPaginationResultWithAggs} from '@api/repo';

import {FiltersBadges} from '@client/containers/filters/FiltersBadges';
import {ArrowsPagination} from '@client/containers/controls/pagination/ArrowsPagination';
import {
  FiltersContainer,
  FiltersPaginationToolbar,
  PageSizeSelectInput,
} from '@client/containers/filters';

import {BooksGrid} from '../grids';
import {BooksFiltersGroups} from './BooksFiltersGroups';

import {serializeAggsToSearchParams} from './helpers/serializeAggsToSearchParams';

const PAGE_SIZES = [
  30,
  36,
  42,
  48,
  54,
];

export function getDefaultBooksFilters() {
  return {
    offset: 0,
    limit: PAGE_SIZES[0],
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
      initialData: () => ({
        ...getDefaultBooksFilters(),
        ...decodedInitialFilters,
      }),
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
        const toolbarRenderFn = (top: boolean) => (
          <>
            {top && (
              <FiltersBadges
                {...l.input()}
                translationsPath='book.filters'
              />
            )}

            <FiltersPaginationToolbar>
              <li>
                <PageSizeSelectInput
                  {...l.input('limit')}
                  sizes={PAGE_SIZES}
                />
              </li>

              <li>
                <ArrowsPagination
                  urlSearchParams={serializedValue}
                  totalItems={safeResult.meta.totalItems}
                  {...l.input()}
                />
              </li>
            </FiltersPaginationToolbar>
          </>
        );

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
            toolbarRenderFn={toolbarRenderFn}
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
