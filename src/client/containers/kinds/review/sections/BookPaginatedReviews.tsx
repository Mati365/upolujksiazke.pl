import React from 'react';
import * as R from 'ramda';

import {useStoreFiltersInURL} from '@client/containers/filters/hooks/useStoreFiltersInURL';
import {useI18n} from '@client/i18n';

import {
  useInputLink,
  useUpdateEffect,
} from '@client/hooks';

import {Section, SectionProps} from '@client/components/ui';
import {QueryLoadingSpinner} from '@client/containers/parts';
import {CommentIcon} from '@client/components/svg';
import {APIQuery} from '@client/modules/api/client/components';
import {BookReviewRecord} from '@api/types';
import {
  FiltersContainer,
  FiltersToolbar,
} from '@client/containers/filters';

import {
  BookReviewsFilters,
  BookReviewsPaginationResult,
} from '@api/repo/BookReviews.repo';

import {BookReviewsList} from '../list/BookReviewsList';

type BookPaginatedReviewsProps = SectionProps & {
  totalReviews: number,
  initialFilters: BookReviewsFilters,
  initialReviews: BookReviewsPaginationResult,
};

export const BookPaginatedReviews = (
  {
    totalReviews,
    initialFilters,
    initialReviews,
    ...props
  }: BookPaginatedReviewsProps,
) => {
  const t = useI18n('book.reviews');
  const {decodedInitialFilters, assignFiltersToURL} = useStoreFiltersInURL();
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
    <Section
      spaced={3}
      title={
        t('title')
      }
      titleSuffix={(
        <span className='c-flex-row is-inline'>
          <CommentIcon className='mr-1' />
          <span>
            {t('total', [totalReviews])}
          </span>
        </span>
      )}
      subsection
      noContentSpacing
      {...props}
    >
      <APIQuery<BookReviewsPaginationResult>
        initialInstant
        loadingComponent={null}
        promiseKey={l.value}
        promiseFn={
          ({api}) => api.repo.booksReviews.findAll(l.value)
        }
        ignoreFirstRenderFetch
      >
        {({result, loading}) => {
          const safeResult = result || initialReviews;

          return (
            <FiltersContainer
              toolbarRenderFn={
                (top) => !top && (
                  <FiltersToolbar
                    totalItems={safeResult.meta.totalItems}
                    l={l}
                    hideSort
                    hidePageSizeSwitch
                    hideViewModeSwitch
                  />
                )
              }
            >
              <BookReviewsList
                reviews={
                  safeResult.items as BookReviewRecord[]
                }
              />

              {loading && (
                <QueryLoadingSpinner layer />
              )}
            </FiltersContainer>
          );
        }}
      </APIQuery>
    </Section>
  );
};

BookPaginatedReviews.displayName = 'BookPaginatedReviews';
