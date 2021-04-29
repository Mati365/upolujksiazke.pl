import React, {ReactNode, useState, useMemo} from 'react';
import * as R from 'ramda';

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
  totalItems: number,
  renderChunkFn(attrs: AsyncChunkAttributes<T>): ReactNode,
  renderExpandToolbarFn?(attrs: AsyncExpandableToolbarProps): ReactNode,
};

export function AsyncExpandableChunks<T extends {id: any}>(
  {
    firstChunk,
    totalItems,
    renderChunkFn,
    renderExpandToolbarFn = (attrs) => (
      <DefaultAsyncExpandableToolbar
        {...attrs}
        tag='li'
      />
    ),
    ...props
  }: AsyncExpandableChunksProps<T>,
) {
  const [allChunks] = useState<T[][]>(
    firstChunk
      ? [firstChunk]
      : [],
  );

  const totalLoaded = useMemo(
    () => R.sum(R.map(R.length, allChunks)),
    [allChunks],
  );

  const onExpand = () => {
    console.info('abc');
  };

  return (
    <CleanList
      block
      inline={false}
      {...props}
    >
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
          remain: totalItems - totalLoaded,
          onExpand,
        },
      )}
    </CleanList>
  );
}
