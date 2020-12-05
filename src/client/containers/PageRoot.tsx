import React from 'react';
import {Route} from 'react-router';

import {PageProviders, PageProvidersProps} from './PageProviders';
import {HomeRoute} from './Routes';

export type PageRootProps = Omit<PageProvidersProps, 'children'>;

export const PageRoot = (providerProps: PageRootProps) => (
  <PageProviders {...providerProps}>
    <Route
      exact
      path='/'
      component={HomeRoute}
    />
  </PageProviders>
);

PageRoot.displayName = 'PageRoot';
