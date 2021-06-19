import React, {useMemo, ReactNode} from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
import {useUA} from '@client/modules/ua';
import {
  useInputLink,
  usePrevious,
  useUpdateEffect,
} from '@client/hooks';

import {
  pickNonPaginationFilters,
  useStoreFiltersInURL,
} from '@client/containers/filters/hooks/useStoreFiltersInURL';

import {AjaxAPIClient} from '@client/modules/api/client/AjaxAPIClient';
import {APIQuery} from '@client/modules/api/client/components';
import {BookCardRecord} from '@api/types';
import {BooksPaginationResultWithAggs} from '@api/repo';
import {SortMode, ViewMode} from '@shared/enums';

import {CanBePromise} from '@shared/types';
import {FiltersBadges} from '@client/containers/filters/FiltersBadges';
import {
  EmptyResults,
  FiltersContainer,
  FiltersPhraseSearchInput,
  DEFAULT_PAGE_SIZES,
  FiltersToolbar,
} from '@client/containers/filters';

import {BooksBacklinks} from './BooksBacklinks';
import {BooksGrid} from '../grids';
import {BooksFiltersGroups} from './BooksFiltersGroups';

import {serializeAggsToSearchParams} from './helpers/serializeAggsToSearchParams';

export function getDefaultBooksFilters() {
  return {
    offset: 0,
    viewMode: ViewMode.GRID,
    sort: SortMode.POPULARITY,
    limit: DEFAULT_PAGE_SIZES[0],
  };
}

type BooksFiltersContainerProps = {
  promiseFn?(
    attrs: {
      api: AjaxAPIClient,
      filters: any,
    }
  ): CanBePromise<BooksPaginationResultWithAggs>,

  hideSort?: boolean,
  hideSidebar?: boolean,
  parentGroups?: ReactNode,
  initialFilters?: any,
  initialBooks: BooksPaginationResultWithAggs,
  overrideFilters?: any,
  filtersSerializeFn?(filters: any): any,
  contentHeader?(
    attrs: {
      searchInput: ReactNode,
    },
  ): ReactNode,
};

export const BooksFiltersContainer = (
  {
    promiseFn,
    hideSort,
    hideSidebar,
    initialBooks,
    initialFilters,
    overrideFilters,
    contentHeader,
    filtersSerializeFn = serializeAggsToSearchParams,
    parentGroups = (
      <BooksBacklinks />
    ),
  }: BooksFiltersContainerProps,
) => {
  const {decodedInitialFilters, assignFiltersToURL} = useStoreFiltersInURL();

  const t = useI18n();
  const ua = useUA();
  const l = useInputLink<any>(
    {
      initialData: () => ({
        ...initialFilters,
        ...decodedInitialFilters,
      }),
      effectFn(prevValue, value) {
        if (R.isEmpty(value)) {
          return {
            ...initialFilters,
            offset: 0,
            limit: prevValue.limit,
          };
        }

        if (prevValue?.offset !== value?.offset
            || prevValue?.viewMode !== value?.viewMode)
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
      serializedValue: filtersSerializeFn(
        {
          ...l.value,
          ...overrideFilters,
        },
      ),
    }),
    [l.value],
  );

  useUpdateEffect(
    () => {
      assignFiltersToURL(l.value);
    },
    [l.value],
  );

  const searchInput = !ua.mobile && (
    <FiltersPhraseSearchInput
      placeholder={
        t('book.filters.phrase.placeholder')
      }
      {...l.input(
        'phrase',
        {
          deleteFromParentIf: (inputValue) => !inputValue,
        },
      )}
    />
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
        ({api}) => (
          promiseFn
            ? promiseFn(
              {
                api,
                filters: serializedValue,
              },
            )
            : api.repo.books.findAggregatedBooks(serializedValue)
        )
      }
      ignoreFirstRenderFetch
    >
      {({result, loading}) => {
        const safeResult = result ?? initialBooks;
        const emptyItems = !loading && R.isEmpty(safeResult.items);

        const toolbarRenderFn = (top: boolean) => (!emptyItems || top) && (
          <FiltersToolbar
            l={l}
            hideSort={
              (!top && ua.mobile) || hideSort
            }
            hidePagination={
              top && ua.mobile
            }
            urlSearchParams={serializedValue}
            totalItems={safeResult.meta.totalItems}
          />
        );

        return (
          <FiltersContainer
            contentHeader={
              contentHeader?.(
                {
                  searchInput,
                },
              )
            }
            loading={loading}
            className='c-books-filters-section'
            sidebarToolbar={parentGroups}
            sidebar={
              !hideSidebar && safeResult.aggs && (
                <BooksFiltersGroups
                  aggs={safeResult.aggs}
                  overrideFilters={overrideFilters}
                  l={l}
                />
              )
            }
            toolbarRenderFn={toolbarRenderFn}
            {...!emptyFilters && {
              onClearFilters: () => l.setValue({}),
            }}
          >
            <FiltersBadges
              {...l.input()}
              translationsPath='book.filters'
            />

            {(
              emptyItems
                ? <EmptyResults />
                : (
                  <BooksGrid
                    viewMode={(
                      ua.mobile
                        ? ViewMode.LIST
                        : +l.value.viewMode
                    )}
                    items={
                      safeResult.items as BookCardRecord[]
                    }
                    columns={{
                      xs: 1,
                      default: 6,
                    }}
                  />
                )
            )}
          </FiltersContainer>
        );
      }}
    </APIQuery>
  );
};

BooksFiltersContainer.displayName = 'BooksFiltersContainer';
