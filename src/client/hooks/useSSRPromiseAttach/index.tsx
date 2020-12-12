import React, {useContext} from 'react';
import * as R from 'ramda';

export type AttachedPromiseCacheParams = {
  key: string,
  expire?: number,
};

export type AttachedPromise = {
  executor: () => Promise<any>,
  cacheParams?: AttachedPromiseCacheParams,
  counter?: number,
};

export type AttachedPromiseCache = {
  counter: number,
  data: object,
};

export type AttachedPromisesCacheMap = Record<string, AttachedPromiseCache>;
export type AttachedPromisesMap = Record<string, AttachedPromise>;

export type SSRContext = {
  promises?: AttachedPromisesMap,
  cache?: AttachedPromisesCacheMap,
  counter: number,

  readCache?(uuid: string): any,
  readCacheStore?(): any,

  attachPromise?(uuid: string, promise: AttachedPromise): void,
  generateUUID?(): number,
};

const createBlankCounter = (): SSRContext => ({
  counter: 0,
  generateUUID: function generateUUID() {
    return this.counter++;
  },
});

export const getDefaultSSRContext = (): SSRContext => ({
  promises: {},
  cache: {},
  attachPromise: R.T,
  counter: 0,
  readCacheStore() {
    return this.cache;
  },
  readCache(uuid: string): any {
    return this.cache[uuid];
  },
});

export const AsyncPromisesContext = React.createContext<SSRContext>(
  getDefaultSSRContext(),
);

export const useAsyncPromisesContext = () => useContext(AsyncPromisesContext);

export const AsyncContextProvider = ({value, children}) => (
  <AsyncPromisesContext.Provider
    value={{
      ...value,
      ...createBlankCounter(),
    }}
  >
    {children}
  </AsyncPromisesContext.Provider>
);
