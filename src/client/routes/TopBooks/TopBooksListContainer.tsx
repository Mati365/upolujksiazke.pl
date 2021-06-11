import React from 'react';
import * as R from 'ramda';

import {
  useInputLink,
  useUpdateEffect,
} from '@client/hooks';

import {useStoreFiltersInURL} from '@client/containers/filters/hooks/useStoreFiltersInURL';

import {ViewMode} from '@shared/enums';
import {BooksPaginationResult} from '@api/repo';
import {APIQuery} from '@client/modules/api/client/components';
import {BookCardRecord} from '@api/types';
import {EmptyResults} from '@client/containers/filters';
import {BooksGrid} from '@client/containers/kinds/book/grids/BooksGrid';

type TopBooksListContainerProps = {
  initialBooks: BooksPaginationResult,
};

export const TopBooksListContainer = ({initialBooks}: TopBooksListContainerProps) => {
  const {
    decodedInitialFilters,
    assignFiltersToURL,
  } = useStoreFiltersInURL();

  const l = useInputLink<any>(
    {
      initialData: () => decodedInitialFilters,
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

  useUpdateEffect(
    () => {
      assignFiltersToURL(l.value);
    },
    [l.value],
  );

  return (
    <APIQuery<BooksPaginationResult>
      initialInstant
      loadingComponent={null}
      promiseFn={
        ({api}) => api.repo.books.findAggregatedBooks()
      }
      ignoreFirstRenderFetch
    >
      {({result, loading}) => {
        const safeResult = result ?? initialBooks;
        const emptyItems = !loading && R.isEmpty(safeResult.items);

        return (
          emptyItems
            ? <EmptyResults />
            : (
              <BooksGrid
                viewMode={ViewMode.LIST}
                items={
                  safeResult.items as BookCardRecord[]
                }
                columns={{
                  xs: 2,
                  default: 6,
                }}
              />
            )
        );
      }}
    </APIQuery>
  );
};

TopBooksListContainer.displayName = 'TopBooksListContainer';
