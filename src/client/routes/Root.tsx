import React from 'react';
import {StaticRouterProps} from 'react-router';

import {AsyncRouterRouteInfo} from '@client/components/utils/asyncRouteUtils';
import {ProvideI18n} from '@client/i18n/ProvideI18n';
import {
  AsyncRouter,
  ViewDataProvider,
} from '@client/components';

import {HomeRoute} from './Home';
import {BookRoute} from './Book';

export const APP_ROUTES_LIST: AsyncRouterRouteInfo[] = [
  {
    component: HomeRoute,
  },
  {
    component: BookRoute,
  },
];

export type PageRootProps = {
  routerConfig?: StaticRouterProps,
  viewData?: any,
};

export const PageRoot = ({viewData, routerConfig}: PageRootProps) => (
  <ViewDataProvider initialData={viewData}>
    <ProvideI18n
      lang={viewData.lang.current}
      translations={viewData.lang.translations}
    >
      <AsyncRouter
        {...routerConfig}
        routes={APP_ROUTES_LIST}
      />
    </ProvideI18n>
  </ViewDataProvider>
);
