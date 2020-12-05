import React, {ReactNode} from 'react';
import {
  AsyncContextProvider,
  getDefaultSSRContext,
  SSRContext,
} from '.';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface Window {
    hydrate: object,
  }
}

export const MAGIC_ASYNC_DATA_CONTEXT = 'resolvedPromises';

export const wrapHydratedAsyncTree = (component: ReactNode) => {
  const initialCacheStore: SSRContext = {
    ...getDefaultSSRContext(),
    cache: window[MAGIC_ASYNC_DATA_CONTEXT] || {},
  };

  return (
    <AsyncContextProvider value={initialCacheStore}>
      {component}
    </AsyncContextProvider>
  );
};
