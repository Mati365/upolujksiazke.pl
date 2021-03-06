import React from 'react';
import {StaticRouterProps} from 'react-router';

import {AsyncRouterRouteInfo} from '@client/components/utils/asyncRouteUtils';
import {
  AsyncRouter,
  ViewDataProvider,
} from '@client/components';

import {HomeRoute} from './Home';

export const APP_ROUTES_LIST: AsyncRouterRouteInfo[] = [
  {
    component: HomeRoute,
    path: '/',
    exact: false,
  },
];

export type PageRootProps = {
  routerConfig?: StaticRouterProps,
  viewData?: object,
};

export const PageRoot = ({viewData, routerConfig}: PageRootProps) => (
  <ViewDataProvider initialData={viewData}>
    <AsyncRouter
      {...routerConfig}
      routes={APP_ROUTES_LIST}
    />
  </ViewDataProvider>
);
