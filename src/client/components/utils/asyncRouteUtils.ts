import {match, matchPath, RouteProps} from 'react-router';

import {findAndMap} from '@shared/helpers/findAndMap';
import {
  CanBeArray,
  CanBePromise,
  Overwrite,
} from '@shared/types';

import {APIClient} from '@api/APIClient';

export type AsyncRouterRouteInfo = Overwrite<RouteProps, {
  component: AsyncRoute<any, any>,
}>;

export type AsyncRouteContext = {
  match: match<any>,
  api: APIClient,
};

export type AsyncRoute<Props = {}, AsyncProps extends Partial<Props> = Props> = {
  (props: Props): JSX.Element | null,
  defaultProps?: Partial<Props>,
  displayName?: string,
  getInitialProps?(ctx?: AsyncRouteContext): CanBePromise<AsyncProps>,
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
 * @returns {obj is AsyncRoute<any, any>}
 */
export function isAsyncRoute(obj: any): obj is AsyncRoute<any, any> {
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
    (route) => {
      const matched = matchPath(path, route.path);
      return {
        matched,
        route,
      };
    },
    routes,
  );

  if (!result || !isAsyncRoute(result.route.component))
    return null;

  return {
    id: genRouteID(result.route as any),
    props: await result.route.component.getInitialProps(
      {
        ...ctx,
        match: result.matched,
      },
    ),
  };
}
