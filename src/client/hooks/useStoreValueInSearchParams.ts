import {useMemo} from 'react';
import {useLocation} from 'react-router-dom';
import * as R from 'ramda';

import {
  decodeUrlParameters,
  encodeURLParams,
  flattenObject,
  unflattenObject,
} from '@shared/helpers';

type StoreValueHookConfig = {
  disabled?: boolean,
  urlValueDecoder?(obj: any): any,
  urlValueEncoder?(obj: any): any,
};

export function useStoreValueInSearchParams(
  {
    disabled,
    urlValueDecoder = R.identity,
    urlValueEncoder = R.identity,
  }: StoreValueHookConfig = {},
) {
  const {search} = useLocation();
  const decodedSearchParams = useMemo(
    () => (
      disabled
        ? null
        : R.pipe(decodeUrlParameters, unflattenObject, urlValueDecoder)(search)
    ),
    [disabled, search],
  );

  const setUrlValue = (value: any) => {
    window
      .history
      .replaceState(null, null, `?${R.pipe(urlValueEncoder, flattenObject, encodeURLParams)(value)}`);
  };

  return {
    setUrlValue,
    decodedSearchParams,
  };
}
