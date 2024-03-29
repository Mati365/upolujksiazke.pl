import React, {MouseEventHandler} from 'react';
import {useLocation} from 'react-router';

import {linkInputs, LinkProps} from '@client/decorators/linkInput';
import {pickEventValue} from '@client/hooks/useInputLink';

import {suppressEvent} from '@client/helpers/html';
import {
  calcPageOffset,
  calcPaginationMetaFromFilters,
} from '@api/helpers';

import {useI18n} from '@client/i18n/hooks/useI18n';
import {useUA} from '@client/modules/ua';

import {BasicLimitPaginationOptions} from '@shared/types';
import {CleanList, UndecoratedLink} from '@client/components/ui';
import {Input} from '@client/components/ui/controls';
import {
  ChevronsLeftIcon,
  ChevronLeftIcon,
  ChevronsRightIcon,
  ChevronRightIcon,
} from '@client/components/svg/Icons';

export type ArrowsPaginationProps = LinkProps<BasicLimitPaginationOptions> & {
  totalItems: number,
  urlSearchParams?: any,
};

export const ArrowsPagination = linkInputs<BasicLimitPaginationOptions>(
  {
    initialData: {},
  },
)(
  ({l, value, totalItems, urlSearchParams}: ArrowsPaginationProps) => {
    const location = useLocation();
    const ua = useUA();
    const t = useI18n('shared');

    const valueWithTotal = {
      ...value,
      totalItems,
    };

    const {page, totalPages} = calcPaginationMetaFromFilters(valueWithTotal);
    const [firstPage, lastPage] = [!page, page + 1 >= totalPages];
    const setOffset = (offset: number, resetScroll: boolean = true) => {
      l.setValue(
        {
          ...value,
          offset,
        },
      );

      if (resetScroll)
        window.scrollTo(0, 0);
    };

    const onHandleOffsetAnchor = (offset: number): MouseEventHandler => (e) => {
      setOffset(offset);
      suppressEvent(e);
    };

    const [
      firstOffset,
      prevOffset,
      nextOffset,
      lastOffset,
    ] = [
      0,
      calcPageOffset(valueWithTotal, page - 1),
      calcPageOffset(valueWithTotal, page + 1),
      (totalPages - 1) * valueWithTotal.limit,
    ];

    return (
      <CleanList
        className='c-arrows-paginate'
        spaced={(
          ua.mobile
            ? 3
            : 2
        )}
        inline
      >
        <li>
          <UndecoratedLink
            className='c-arrows-paginate__absolute-btn'
            href={location.pathname}
            searchParams={{
              ...urlSearchParams,
              offset: firstOffset,
            }}
            disabled={firstPage}
            onClick={
              onHandleOffsetAnchor(firstOffset)
            }
          >
            <ChevronsLeftIcon />
          </UndecoratedLink>
        </li>

        <li>
          <UndecoratedLink
            className='c-arrows-paginate__relative-btn'
            href={location.pathname}
            rel='prev'
            searchParams={{
              ...urlSearchParams,
              offset: prevOffset,
            }}
            disabled={firstPage}
            onClick={
              onHandleOffsetAnchor(prevOffset)
            }
          >
            <ChevronLeftIcon />
          </UndecoratedLink>
        </li>

        <li className='c-arrows-paginate__input-item'>
          <Input
            value={page + 1}
            onChange={
              (e) => setOffset(
                calcPageOffset(valueWithTotal, +pickEventValue(e)) - 1,
                false,
              )
            }
          />
          <span className='c-arrows-paginate__of'>
            {t('titles.of')}
          </span>
          <span>{totalPages}</span>
        </li>

        <li>
          <UndecoratedLink
            className='c-arrows-paginate__relative-btn'
            href={location.pathname}
            rel='next'
            searchParams={{
              ...urlSearchParams,
              offset: nextOffset,
            }}
            disabled={lastPage}
            onClick={
              onHandleOffsetAnchor(nextOffset)
            }
          >
            <ChevronRightIcon />
          </UndecoratedLink>
        </li>

        <li>
          <UndecoratedLink
            className='c-arrows-paginate__absolute-btn'
            disabled={lastPage}
            href={location.pathname}
            searchParams={{
              ...urlSearchParams,
              offset: lastOffset,
            }}
            onClick={
              onHandleOffsetAnchor(lastOffset)
            }
          >
            <ChevronsRightIcon />
          </UndecoratedLink>
        </li>
      </CleanList>
    );
  },
);

ArrowsPagination.displayName = 'ArrowsPagination';
