import React, {ReactNode, useState, useMemo} from 'react';
import * as R from 'ramda';

import {
  usePrevious,
  usePromiseCallback,
} from '@client/hooks';

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
  header?: ReactNode,
  firstChunk?: T[],
  resetKey?: any,
  totalItems: number,
  renderChunkFn(attrs: AsyncChunkAttributes<T>): ReactNode,
  renderExpandToolbarFn?(attrs: AsyncExpandableToolbarProps): ReactNode,
  onRequestChunk(
    atrs: {
      loadedChunks: T[][],
      totalLoaded: number,
      expandBy: number,
    },
  ): CanBePromise<T[]>,
};

export function AsyncExpandableChunks<T extends {id: any}>(
  {
    header,
    resetKey,
    firstChunk,
    totalItems,
    renderChunkFn,
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
  const prevResetKey = usePrevious(resetKey);
  const [allChunks, setAllChunks] = useState<T[][]>(
    firstChunk
      ? [firstChunk]
      : [],
  );

  const totalLoaded = useMemo(
    () => R.sum(R.map(R.length, allChunks)),
    [allChunks.length],
  );

  const remain = totalItems - totalLoaded;
  const [onExpand] = usePromiseCallback(
    async () => {
      const chunk = await onRequestChunk(
        {
          loadedChunks: allChunks,
          expandBy: Math.min(remain, firstChunk?.length || 0),
          totalLoaded,
        },
      );

      // rerendered anyway
      if (chunk?.length)
        allChunks.push(chunk);
    },
  );

  if (prevResetKey !== null && !R.isNil(resetKey) && prevResetKey !== resetKey)
    setAllChunks([firstChunk]);

  return (
    <CleanList
      block
      inline={false}
      {...props}
    >
      {header}
      {allChunks.map(
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
      {renderExpandToolbarFn(
        {
          loaded: totalLoaded,
          remain,
          onExpand,
        },
      )}
    </CleanList>
  );
}
