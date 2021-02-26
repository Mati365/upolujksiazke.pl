import React from 'react';
import {
  Route, Switch,
  StaticRouterProps, RouteProps,
} from 'react-router';

import {safeArray} from '@shared/helpers/safeArray';
import {
  IsomorphicRouter,
  ViewDataProvider,
} from '@client/components';

import {HomeRoute} from './Home';

export const APP_ROUTES_LIST: RouteProps[] = [
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
    <IsomorphicRouter {...routerConfig}>
      <Switch>
        {APP_ROUTES_LIST.map(
          (route) => (
            <Route
              key={safeArray(route.path).join(',')}
              {...route}
            />
          ),
        )}
      </Switch>
    </IsomorphicRouter>
  </ViewDataProvider>
);
