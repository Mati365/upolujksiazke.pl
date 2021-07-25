import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {
  Route, StaticRouter,
  StaticRouterProps, Switch,
} from 'react-router';

import {isSSR} from '@shared/helpers';
import {AsyncRoutePreloader} from './AsyncRoute';
import {AsyncRouterRouteInfo, genRouteID} from './utils/asyncRouteUtils';

export const IsomorphicRouter: any = (
  isSSR()
    ? StaticRouter
    : BrowserRouter
);

type AsyncRouterProps = StaticRouterProps & {
  routes: AsyncRouterRouteInfo[],
};

export const AsyncRouter = ({routes, ...routerProps}: AsyncRouterProps) => (
  <IsomorphicRouter {...routerProps}>
    <Switch>
      {routes.map(
        ({component: Component, ...props}) => {
          const {route: routeInfo} = Component;
          const id = genRouteID(
            {
              path: routeInfo.path,
            },
          );

          return (
            <Route
              key={id}
              path={routeInfo.path}
              render={() => (
                <AsyncRoutePreloader
                  id={id}
                  component={Component}
                />
              )}
              exact={routeInfo.exact}
              {...props}
            />
          );
        },
      )}
    </Switch>
  </IsomorphicRouter>
);

AsyncRouter.displayName = 'AsyncRouter';
