import {last, repeat} from 'ramda';

import {
  BrochurePageKind,
  BrochurePageRecord,
} from '@api/types';

import {BrochurePagesChunk} from '../context/utils';

export function createEmptyPagesArray(length: number): BrochurePageRecord[] {
  return repeat(
    {
      id: Date.now(),
      kind: BrochurePageKind.EMPTY,
      index: null,
      image: null,
    },
    length,
  );
}

export function splitPagesToChunks(chunksSize: number, pages: BrochurePageRecord[]): BrochurePagesChunk[] {
  const [pp, ...rest] = pages;
  const chunks: BrochurePagesChunk[] = [
    [
      ...createEmptyPagesArray(Math.max(0, chunksSize - 1)),
      pp,
    ],
  ];

  for (let i = 0; i < rest.length; ++i) {
    const page = rest[i];
    const lastChunk = last(chunks);

    if (lastChunk.length === chunksSize || !lastChunk[0])
      chunks.push([]);

    last(chunks).push(page);
  }

  const missingZoPages = chunksSize - last(chunks).length;
  if (missingZoPages > 0) {
    last(chunks).push(
      ...createEmptyPagesArray(missingZoPages),
    );
  }

  return chunks;
}
