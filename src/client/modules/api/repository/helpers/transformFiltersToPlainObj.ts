import * as R from 'ramda';

import {flattenObject} from '@shared/helpers';
import {PaginationFilters} from '../base/BaseAPIRepo';

const serializeSort = R.compose(
  R.map(([sortKey, value]) => `${sortKey},${value}`),
  R.toPairs,
);

/**
 * Due to problems in dry-struct with key: abc.de decrypt
 * encrypt keys to abc[de]
 *
 * @export
 * @param {string} prefix
 * @param {*} key
 */
export function dryStructPrefixer(prefix: string, key: any) {
  return `${prefix}[${key}]`;
}

export function transformFiltersToPlainObj<V>(filters: PaginationFilters<V>) {
  if (!filters)
    return filters;

  const {sort, ...plainItems} = filters;
  const obj = {
    ...flattenObject(
      plainItems,
      {
        prefixBuilderFn: dryStructPrefixer,
        joinArraySeparator: ',',
      },
    ),
    ...sort && {
      sort: serializeSort(sort),
    },
  };

  for (const key in obj) {
    if (R.isNil(obj[key]) || (R.is(Array, obj[key]) && R.all(R.isNil, obj[key])))
      delete obj[key];
  }

  return obj;
}
