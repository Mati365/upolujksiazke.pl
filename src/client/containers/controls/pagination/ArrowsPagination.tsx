import React from 'react';

import {linkInputs, LinkProps} from '@client/decorators/linkInput';
import {pickEventValue} from '@client/hooks/useInputLink';
import {
  calcPageOffset,
  calcPaginationMetaFromFilters,
} from '@api/helpers';

import {useI18n} from '@client/i18n/hooks/useI18n';

import {PaginationMeta} from '@shared/types';
import {CleanList, TextButton} from '@client/components/ui';
import {Input} from '@client/components/ui/controls';
import {
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronsRightIcon,
  ChevronRightIcon,
} from '@client/components/svg/Icons';

export type ArrowsPaginationProps = LinkProps<PaginationMeta>;

export const ArrowsPagination = linkInputs<PaginationMeta>(
  {
    initialData: {},
  },
)(
  ({l, value}: ArrowsPaginationProps) => {
    const t = useI18n('shared');
    const {page, totalPages} = calcPaginationMetaFromFilters(value);
    const [firstPage, lastPage] = [!page, page + 1 >= totalPages];

    if (totalPages <= 1)
      return null;

    const setPage = (newPage: number, resetScroll: boolean = true, offset?: boolean) => {
      l.setValue(
        {
          ...value,
          offset: (
            offset
              ? newPage
              : calcPageOffset(value, newPage)
          ),
        },
      );

      if (resetScroll)
        window.scrollTo(0, 0);
    };

    return (
      <CleanList
        className='c-arrows-paginate'
        spaced={2}
        inline
      >
        <li>
          <TextButton
            className='c-arrows-paginate__absolute-btn'
            disabled={firstPage}
            onClick={() => setPage(0)}
          >
            <ChevronsLeftIcon />
          </TextButton>
        </li>

        <li>
          <TextButton
            className='c-arrows-paginate__relative-btn'
            disabled={firstPage}
            onClick={() => setPage(page - 1)}
          >
            <ChevronLeftIcon />
          </TextButton>
        </li>

        <li className='c-arrows-paginate__input-item'>
          <Input
            value={page + 1}
            onChange={
              (e) => setPage(+pickEventValue(e) - 1, false)
            }
          />
          <span className='c-arrows-paginate__of'>
            {t('titles.of')}
          </span>
          <span>{totalPages}</span>
        </li>

        <li>
          <TextButton
            className='c-arrows-paginate__relative-btn'
            disabled={lastPage}
            onClick={() => setPage(page + 1)}
          >
            <ChevronRightIcon />
          </TextButton>
        </li>

        <li>
          <TextButton
            className='c-arrows-paginate__absolute-btn'
            disabled={lastPage}
            onClick={
              () => setPage(
                value.totalItems - value.limit - 1,
                true,
                true,
              )
            }
          >
            <ChevronsRightIcon />
          </TextButton>
        </li>

        <li className='ml-auto'>
          {/* <ItemsPerPageSelect
            className='mb-0'
            {...l.input('limit')}
          /> */}
        </li>
      </CleanList>
    );
  },
);

ArrowsPagination.displayName = 'ArrowsPagination';
