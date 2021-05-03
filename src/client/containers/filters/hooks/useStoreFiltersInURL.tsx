import {useHistory, useLocation} from 'react-router';
import {useMemo} from 'react';
import * as R from 'ramda';

import {
  encodeURLParams,
  decodeUrlParams,
  flattenObject,
  unflattenObject,
} from '@shared/helpers';

export function serializeUrlFilters(obj: any) {
  const mapper = R.cond(
    [
      [R.is(Array), (...args) => mapper(...args)],
      [
        R.both(R.is(Object), R.has('id')),
        R.pick(['id', 'name']),
      ],
      [R.is(Object), R.mapObjIndexed((...args) => mapper(...args))],
      [R.T, R.identity],
    ],
  );

  return encodeURLParams(
    flattenObject(R.mapObjIndexed(mapper, obj)),
  );
}

export function deserializeUrlFilters(search: string|object) {
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
      : params
  );
}

export function useStoreFiltersInURL(
  {
    initialFilters,
  }: {
    initialFilters?: any,
  } = {},
) {
  const history = useHistory();
  const location = useLocation();

  const decodedInitialFilters = useMemo(
    () => {
      if (initialFilters)
        return initialFilters;

      return deserializeUrlFilters(location.search);
    },
    [],
  );

  const assignFiltersToURL = (filters: any) => {
    history.replace(
      {
        search: serializeUrlFilters(
          {
            ...filters,
            meta: R.pick(['limit', 'offset'], filters?.meta || {}),
          },
        ),
      },
    );
  };

  return {
    decodedInitialFilters,
    assignFiltersToURL,
  };
}
