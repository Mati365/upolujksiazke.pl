import React, {useMemo, ReactNode} from 'react';
import * as R from 'ramda';

import {useI18n} from '@client/i18n';
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
import {SortMode, ViewMode} from '@shared/enums';

import {FiltersBadges} from '@client/containers/filters/FiltersBadges';
import {ArrowsPagination} from '@client/containers/controls/pagination/ArrowsPagination';
import {
  EmptyResults,
  FiltersContainer,
  FiltersPaginationToolbar,
  PageSizeSelectInput,
  SortSelectInput,
  ViewModeSwitch,
  FiltersPhraseSearchInput,
} from '@client/containers/filters';

import {BooksBacklinks} from './BooksBacklinks';
import {BooksGrid} from '../grids';
import {BooksFiltersGroups} from './BooksFiltersGroups';

import {serializeAggsToSearchParams} from './helpers/serializeAggsToSearchParams';

const PAGE_SIZES = [30, 36, 42, 48, 54];

export function getDefaultBooksFilters() {
  return {
    offset: 0,
    viewMode: ViewMode.GRID,
    sort: SortMode.POPULARITY,
    limit: PAGE_SIZES[0],
  };
}

type BooksFiltersContainerProps = {
  hideSidebar?: boolean,
  parentGroups?: ReactNode,
  initialFilters?: any,
  initialBooks: BooksPaginationResultWithAggs,
  overrideFilters?: any,
  contentHeader?(
    attrs: {
      searchInput: ReactNode,
    },
  ): ReactNode,
};

export const BooksFiltersContainer = (
  {
    hideSidebar,
    initialBooks,
    initialFilters,
    overrideFilters,
    contentHeader,
    parentGroups = (
      <BooksBacklinks />
    ),
  }: BooksFiltersContainerProps,
) => {
  const t = useI18n();
  const {
    decodedInitialFilters,
    assignFiltersToURL,
  } = useStoreFiltersInURL();

  const l = useInputLink<any>(
    {
      initialData: () => ({
        ...initialFilters,
        ...decodedInitialFilters,
      }),
      effectFn(prevValue, value) {
        if (R.isEmpty(value))
          return getDefaultBooksFilters();

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
      serializedValue: serializeAggsToSearchParams(
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

  const searchInput = (
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
        ({api}) => api.repo.books.findAggregatedBooks(serializedValue)
      }
      ignoreFirstRenderFetch
    >
      {({result, loading}) => {
        const safeResult = result ?? initialBooks;
        const emptyItems = !loading && R.isEmpty(safeResult.items);

        const toolbarRenderFn = (top: boolean) => (!emptyItems || top) && (
          <>
            <FiltersPaginationToolbar>
              <li>
                <SortSelectInput {...l.input('sort')} />
              </li>
            </FiltersPaginationToolbar>

            <FiltersPaginationToolbar className='ml-auto'>
              <li>
                <PageSizeSelectInput
                  {...l.input('limit')}
                  sizes={PAGE_SIZES}
                />
              </li>

              <li>
                <ViewModeSwitch {...l.input('viewMode')} />
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
              !hideSidebar && (
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
                    viewMode={
                      +l.value.viewMode
                    }
                    items={
                      safeResult.items as BookCardRecord[]
                    }
                    columns={{
                      xs: 2,
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
