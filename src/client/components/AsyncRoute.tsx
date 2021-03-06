import React from 'react';
import {useRouteMatch} from 'react-router';

import {usePromise} from '@client/hooks';
import {useViewData} from './ViewDataProvider';

import {AsyncRoute} from './utils/asyncRouteUtils';

type AsyncRoutePreloaderProps = {
  id: string,
  component: AsyncRoute<any, any>,
  loaderComponent?: React.ComponentType,
};

export const AsyncRoutePreloader = (
  {
    id,
    component: Component,
    loaderComponent: Loader = () => null,
  }: AsyncRoutePreloaderProps,
) => {
  const match = useRouteMatch();
  const viewData = useViewData<{asyncRoute: object}>();
  const cache = viewData?.asyncRoute || {};

  const promiseState = usePromise(
    {
      skip: id in cache,
      initialData: cache[id],
      fn: () => Component?.getInitialProps(
        {
          api: null,
          match,
        },
      ),
      preserveContentOnReload: false,
      keys: [],
    },
  );

  if (promiseState?.loading)
    return <Loader />;

  return (
    <Component {...promiseState.result} />
  );
};
