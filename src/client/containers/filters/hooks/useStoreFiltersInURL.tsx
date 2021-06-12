import {useHistory, useLocation} from 'react-router';
import {useMemo} from 'react';
import * as R from 'ramda';

import {
  encodeURLParams,
  decodeUrlParams,
  flattenObject,
  unflattenObject,
} from '@shared/helpers';

export function deserializePaginationFilters(obj: any) {
  const toInt = (n: string) => Number.parseInt(n, 10);

  return R.evolve(
    {
      limit: toInt,
      offset: toInt,
      viewMode: toInt,
    },
    obj,
  );
}

export function pickNonPaginationFilters(obj: any) {
  return R.omit(
    ['offset', 'limit', 'sort', 'viewMode'],
    obj,
  );
}

export function serializeUrlFilters(obj: any) {
  if (!obj)
    return null;

  const mapper = R.cond(
    [
      [R.is(Array), R.map((...args) => mapper(...args))],
      [
        R.both(R.is(Object), R.has('id')),
        R.pick(['id', 'name']),
      ],
      [R.is(Object), R.mapObjIndexed((...args) => mapper(...args))],
      [R.T, R.identity],
    ],
  );

  return flattenObject(R.mapObjIndexed(mapper, obj));
}

export function deserializeUrlFilters(search: string | object) {
  if (!search)
    return null;

  const params = unflattenObject(
    R.when(
      R.is(String),
      decodeUrlParams,
      search,
    ),
  );

  return (
    R.isEmpty(params)
      ? null
      : deserializePaginationFilters(params)
  );
}

export function useStoreFiltersInURL(
  {
    decodedFilters,
  }: {
    decodedFilters?: any,
  } = {},
) {
  const history = useHistory();
  const location = useLocation();

  const decodedInitialFilters = useMemo(
    () => {
      if (decodedFilters)
        return decodedFilters;

      return {
        ...decodedFilters,
        ...deserializeUrlFilters(location.search),
      };
    },
    [],
  );

  const assignFiltersToURL = (filters: any, reactRouterHistory: boolean = false) => {
    const searchQuery = encodeURLParams(
      serializeUrlFilters(filters),
    );

    if (reactRouterHistory) {
      history.replace(
        {
          search: searchQuery,
        },
      );
    } else
      window.history.replaceState(null, null, `?${searchQuery}`);
  };

  return {
    decodedInitialFilters,
    assignFiltersToURL,
  };
}
