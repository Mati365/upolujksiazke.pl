import {match, matchPath} from 'react-router';

import {findAndMap} from '@shared/helpers/findAndMap';
import {
  CanBeArray,
  CanBePromise,
} from '@shared/types';

import {APIClient} from '@api/APIClient';

export type AsyncRouterRouteInfo = {
  component: AsyncRoute<any>,
};

export type AsyncRouteContext = {
  match: match<any>,
  api: APIClient,
};

export type AsyncPropsComponent<Props = any, AsyncProps extends Partial<Props> = Partial<Props>> = {
  (props: Props): JSX.Element | null,
  defaultProps?: Partial<Props>,
  displayName?: string,
  getInitialProps?(ctx?: AsyncRouteContext): CanBePromise<AsyncProps>,
};

export type AsyncRoute<Props = {}> = AsyncPropsComponent<Props> & {
  route: {
    path: string,
    exact?: boolean,
  },
};

/**
 * Generates route react key
 *
 * @export
 * @param {{path: CanBeArray<string>}} {path}
 * @returns
 */
export function genRouteID({path}: {path: CanBeArray<string>}) {
  return (
    path instanceof Array
      ? path[0]
      : path
  );
}

/**
 * Checks if provided obj is async rotue
 *
 * @export
 * @param {*} obj
 * @returns {obj is AsyncRoute<any>}
 */
export function isAsyncRoute(obj: any): obj is AsyncRoute<any> {
  return !!(obj && 'getInitialProps' in obj);
}

/**
 * Iterates over routes and executes getInitialProps from matched
 *
 * @async
 * @export
 * @param {Object} attrs
 */
export async function preloadAsyncRouteProps(
  {
    routes,
    path,
    ctx,
  }: {
    routes: AsyncRouterRouteInfo[],
    path: string,
    ctx: Omit<AsyncRouteContext, 'match'>,
  },
) {
  const result = findAndMap(
    ({component}) => {
      const {route: routeInfo} = component;
      const matched = matchPath(
        path,
        {
          path: routeInfo.path,
          exact: routeInfo.exact,
        },
      );

      if (!matched)
        return null;

      return {
        matched,
        component,
      };
    },
    routes,
  );

  if (!result || !isAsyncRoute(result.component))
    return null;

  return {
    id: genRouteID(result.component.route),
    props: await result.component.getInitialProps(
      {
        ...ctx,
        match: result.matched,
      },
    ),
  };
}
