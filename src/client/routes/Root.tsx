import React from 'react';
import {StaticRouterProps} from 'react-router';

import {AsyncRouterRouteInfo} from '@client/components/utils/asyncRouteUtils';
import {ModalsContextProvider} from '@client/hooks/useModal';
import {ProvideI18n} from '@client/i18n/ProvideI18n';
import {
  AsyncRouter,
  ViewDataProvider,
} from '@client/components';

import {HomeRoute} from './Home';
import {BookRoute} from './Book';
import {AuthorRoute} from './Author';

export const APP_ROUTES_LIST: AsyncRouterRouteInfo[] = [
  {
    component: HomeRoute,
  },
  {
    component: BookRoute,
  },
  {
    component: AuthorRoute,
  },
];

export type PageRootProps = {
  routerConfig?: StaticRouterProps,
  initialViewData?: any,
};

export const PageRoot = ({initialViewData, routerConfig}: PageRootProps) => (
  <ViewDataProvider initialData={initialViewData}>
    {(viewData) => (
      <ProvideI18n
        lang={viewData.lang.current}
        translations={viewData.lang.translations}
      >
        <ModalsContextProvider>
          <AsyncRouter
            {...routerConfig}
            routes={APP_ROUTES_LIST}
          />
        </ModalsContextProvider>
      </ProvideI18n>
    )}
  </ViewDataProvider>
);
