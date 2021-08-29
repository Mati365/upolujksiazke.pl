import React, {useMemo, ReactNode} from 'react';
import * as R from 'ramda';

import {
  AsyncExpandableChunks,
  CleanList,
} from '@client/components/ui';

type BacklinksListProps<T> = {
  header?: ReactNode,
  links: T[],
  renderLinkFn(link: T): ReactNode,
};

export function BacklinksList<T extends {id: any}>(
  {
    header,
    links,
    renderLinkFn,
  }: BacklinksListProps<T>,
) {
  const chunks = useMemo(
    () => R.splitEvery(7, links),
    [links],
  );

  return (
    <AsyncExpandableChunks
      className='c-filters-backlinks-list'
      firstChunk={chunks[0]}
      totalItems={links.length}
      onRequestChunk={
        ({loadedChunks}) => chunks[loadedChunks.length]
      }
      renderChunkFn={
        ({chunk, index}) => (
          <CleanList
            block
            className='c-filters-backlinks-list__chunk'
            inline={false}
          >
            {!index && header}
            {chunk.map(
              (link) => (
                <li key={link.id}>
                  {renderLinkFn(link)}
                </li>
              ),
            )}
          </CleanList>
        )
      }
    />
  );
}
