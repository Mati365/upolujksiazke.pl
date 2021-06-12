import React from 'react';
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
  pageSizes?: number[],
  urlSearchParams?: any,
};

export const FiltersToolbar = (
  {
    l,
    hideSort,
    urlSearchParams,
    totalItems,
    pageSizes = DEFAULT_PAGE_SIZES,
  }: FiltersToolbarProps,
) => (
  <>
    {!hideSort && (
      <FiltersPaginationToolbar>
        <li>
          <SortSelectInput {...l.input('sort')} />
        </li>
      </FiltersPaginationToolbar>
    )}

    <FiltersPaginationToolbar className='ml-auto'>
      <li>
        <PageSizeSelectInput
          {...l.input('limit')}
          sizes={pageSizes}
        />
      </li>

      <li>
        <ViewModeSwitch {...l.input('viewMode')} />
      </li>

      <li>
        <ArrowsPagination
          urlSearchParams={urlSearchParams}
          totalItems={totalItems}
          {...l.input()}
        />
      </li>
    </FiltersPaginationToolbar>
  </>
);

FiltersToolbar.displayName = 'FiltersToolbar';
