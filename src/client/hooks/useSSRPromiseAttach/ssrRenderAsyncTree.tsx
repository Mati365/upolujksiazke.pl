import React, {ReactNode} from 'react';
import * as R from 'ramda';
import * as ReactServer from 'react-dom/server';

import {mapObjValuesToPromise} from '@shared/helpers';
import {
  AsyncContextProvider,
  AttachedPromise,
  AttachedPromiseCache,
  AttachedPromisesCacheMap,
  AttachedPromisesMap,
  SSRContext,
} from '.';

export type SSRPromiseAccumulator = {
  promises: AttachedPromisesMap,
  cache: AttachedPromisesCacheMap,
  toJSON?(): object,
};

export const createBlankAsyncAccumulator: () => SSRPromiseAccumulator = () => ({
  promises: {},
  cache: {},
});

export type SsrRendererParams = {
  depth?: number,
  maxDepth?: number,
  readParentCache?(uuid: string): {
    data: any,
  },
  mapperFn?(val: AttachedPromise, key: string): Promise<any>,
  accumulator?: SSRPromiseAccumulator,
  htmlModifier?(html: string): string,
};

export const ssrRenderAsyncTree = (
  params: SsrRendererParams = {},
) => async (fn: (acc: SSRPromiseAccumulator) => ReactNode) => {
  const {
    htmlModifier,
    readParentCache,
    depth = 0,
    maxDepth = 2,
    mapperFn = (val: AttachedPromise) => val.executor(),
    accumulator = {
      promises: {},
      cache: {},
    },
  } = params;

  const {promises, cache}: SSRPromiseAccumulator = accumulator;
  const usedParentCache: AttachedPromisesCacheMap = {};

  const asyncContext: SSRContext = {
    cache,
    promises,
    counter: 0,
    readCache(uuid: string): any {
      if (readParentCache) {
        const parentCache = readParentCache(uuid);
        if (!R.isNil(parentCache)) {
          usedParentCache[uuid] = {
            counter: (usedParentCache[uuid]?.counter || 0) + 1,
            data: parentCache.data,
          };

          return usedParentCache[uuid];
        }
      }

      return this.cache[uuid];
    },
    attachPromise(uuid: string, promise: AttachedPromise) {
      if (uuid in promises) {
        const cached = promises[uuid];
        cached.counter++;
        return cached;
      }

      promises[uuid] = {
        ...promise,
        counter: 1,
      };

      return promise;
    },
  };

  let html = ReactServer.renderToString(
    <AsyncContextProvider value={asyncContext}>
      {fn(
        {
          ...accumulator,
          toJSON() {
            return {
              ...accumulator.cache,
              ...usedParentCache,
            };
          },
        },
      )}
    </AsyncContextProvider>,
  );

  if (htmlModifier)
    html = htmlModifier(html);

  if (R.isEmpty(promises) || depth >= maxDepth)
    return html;

  const newCache: AttachedPromisesCacheMap = await mapObjValuesToPromise(
    async (val: AttachedPromise, key: string): Promise<AttachedPromiseCache> => ({
      counter: val.counter,
      data: await mapperFn(val, key),
    }),
    asyncContext.promises,
  );

  accumulator.promises = {};
  Object.assign(cache, newCache);

  return ssrRenderAsyncTree(
    {
      ...params,
      depth: depth + 1,
    },
  )(fn);
};
