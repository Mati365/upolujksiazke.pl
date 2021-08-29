import React, {ReactNode, useState, useMemo} from 'react';
import * as R from 'ramda';

import {extractPropIfPresent} from '@shared/helpers';

import {
  LinkInputAttachParams,
  useInputLink,
  usePrevious,
  usePromiseCallback,
} from '@client/hooks';

import {EmptyResults} from '@client/containers/filters';
import {CanBePromise} from '@shared/types';
import {
  AsyncExpandableToolbarProps,
  DefaultAsyncExpandableToolbar,
} from './DefaultAsyncExpandableToolbar';

import {
  CleanList,
  CleanListProps,
} from '../CleanList';

export type AsyncChunkAttributes<T> = {
  index: number,
  chunk: T[],
};

export type AsyncExpandableChunksProps<T> = CleanListProps & {
  firstChunk?: T[],
  resetKey?: any,
  totalItems: number,
  initialFilters?: any,
  renderEmptyPlaceholderFn?(): ReactNode,
  renderChunkFn(attrs: AsyncChunkAttributes<T>): ReactNode,
  renderExpandToolbarFn?(attrs: AsyncExpandableToolbarProps): ReactNode,
  onRequestChunk(
    atrs: {
      filters: any,
      loadedChunks: T[][],
      totalLoaded: number,
      expandBy: number,
    },
  ): CanBePromise<T[] | {total: number, items: T[]}>,

  renderHeaderFn?(
    attrs: {
      filtersLink: LinkInputAttachParams<any>,
    },
  ): ReactNode,
};

export function AsyncExpandableChunks<T extends {id: any}>(
  {
    resetKey,
    firstChunk,
    totalItems,
    initialFilters = {},
    renderHeaderFn,
    renderChunkFn,
    renderEmptyPlaceholderFn = () => (
      <li>
        <EmptyResults />
      </li>
    ),
    renderExpandToolbarFn = (attrs) => (
      <DefaultAsyncExpandableToolbar
        {...attrs}
        tag='li'
      />
    ),
    onRequestChunk,
    ...props
  }: AsyncExpandableChunksProps<T>,
) {
  const [allChunks, setAllChunks] = useState<{items: T[][], total: number}>(
    {
      items: (
        firstChunk
          ? [firstChunk]
          : []
      ),
      total: totalItems,
    },
  );

  const filtersLink = useInputLink(
    {
      initialData: initialFilters,
    },
  );

  const totalLoaded = useMemo(
    () => R.sum(R.map(R.length, allChunks.items)),
    [allChunks.items],
  );

  const prevResetKey = usePrevious(resetKey);
  const prevFiltersValue = usePrevious(filtersLink.value);

  const remain = allChunks.total - totalLoaded;
  const [onExpand] = usePromiseCallback(
    async (reset?: boolean) => {
      const chunk = await onRequestChunk(
        {
          filters: filtersLink.value,
          expandBy: Math.min(remain, firstChunk?.length || 0),
          ...(
            reset
              ? {
                loadedChunks: [],
                totalLoaded: 0,
              }
              : {
                loadedChunks: allChunks.items,
                totalLoaded,
              }
          ),
        },
      );

      const [items, total] = [
        extractPropIfPresent('items', chunk),
        extractPropIfPresent('total', chunk),
      ];

      let newValue: Partial<Pick<typeof allChunks, 'items' | 'total'>> = null;
      if (total === 0) {
        newValue = {
          items: [],
          total: 0,
        };
      } else if (reset) {
        newValue = {
          items: [items],
          total: (chunk as any).total ?? totalItems ?? 0,
        };
      } else if (items?.length) {
        newValue = {
          items: [
            ...allChunks.items,
            items,
          ],
        };
      }

      Object.assign(allChunks, newValue);
    },
  );

  if ((prevFiltersValue !== null && filtersLink.value !== prevFiltersValue)
      || (prevResetKey !== null && !R.isNil(resetKey) && prevResetKey !== resetKey)) {
    if (!R.isEmpty(filtersLink.value))
      onExpand(true);
    else {
      setAllChunks(
        {
          items: [firstChunk],
          total: totalItems,
        },
      );
    }
  }

  return (
    <CleanList
      block
      inline={false}
      {...props}
    >
      {renderHeaderFn?.(
        {
          filtersLink,
        },
      )}
      {allChunks.items.map(
        (chunk, index) => {
          if (!chunk?.length)
            return null;

          return (
            <li key={chunk[0].id}>
              {renderChunkFn(
                {
                  chunk,
                  index,
                },
              )}
            </li>
          );
        },
      )}
      {!allChunks.total && renderEmptyPlaceholderFn?.()}
      {remain > 0 && renderExpandToolbarFn(
        {
          loaded: totalLoaded,
          remain,
          onExpand,
        },
      )}
    </CleanList>
  );
}
