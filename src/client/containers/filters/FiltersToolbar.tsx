import React from 'react';

import {useUA} from '@client/modules/ua';

import {LinkInputAttachParams} from '@client/hooks/useInputLink';
import {FiltersPaginationToolbar} from './FiltersContainer';
import {ArrowsPagination} from '../controls/pagination/ArrowsPagination';
import {
  PageSizeSelectInput,
  SortSelectInput,
  ViewModeSwitch,
} from './controls';

export const DEFAULT_PAGE_SIZES = [30, 36, 42, 48, 54];

type FiltersToolbarProps = {
  l: LinkInputAttachParams<any>,
  totalItems: number,
  hideSort?: boolean,
  hidePagination?: boolean,
  hidePageSizeSwitch?: boolean,
  hideViewModeSwitch?: boolean,
  pageSizes?: number[],
  urlSearchParams?: any,
};

export const FiltersToolbar = (
  {
    l,
    hideSort,
    hidePagination,
    urlSearchParams,
    hidePageSizeSwitch,
    hideViewModeSwitch,
    totalItems,
    pageSizes = DEFAULT_PAGE_SIZES,
  }: FiltersToolbarProps,
) => {
  const ua = useUA();
  if (hideSort && hidePagination && ua.mobile)
    return null;

  return (
    <>
      {!hideSort && (
        <FiltersPaginationToolbar>
          <li>
            <SortSelectInput {...l.input('sort')} />
          </li>
        </FiltersPaginationToolbar>
      )}

      <FiltersPaginationToolbar
        className={(
          ua.mobile
            ? 'mx-auto'
            : 'ml-auto'
        )}
      >
        {!ua.mobile && (
          <>
            {!hidePageSizeSwitch && (
              <li>
                <PageSizeSelectInput
                  {...l.input('limit')}
                  sizes={pageSizes}
                />
              </li>
            )}

            {!hideViewModeSwitch && (
              <li>
                <ViewModeSwitch {...l.input('viewMode')} />
              </li>
            )}
          </>
        )}

        {!hidePagination && (
          <li>
            <ArrowsPagination
              urlSearchParams={urlSearchParams}
              totalItems={totalItems}
              {...l.input()}
            />
          </li>
        )}
      </FiltersPaginationToolbar>
    </>
  );
};

FiltersToolbar.displayName = 'FiltersToolbar';
