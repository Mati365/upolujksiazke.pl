import * as R from 'ramda';

type EncodeValue = Parameters<typeof encodeURIComponent>[0];

export const decodeUrlParams = R.ifElse(
  R.either(R.isNil, R.isEmpty),
  R.always({}),
  R.compose(
    R.fromPairs,
    <any> R.map(
      (str: string) => {
        const [key, value] = R.split('=', str);

        return [
          key,
          decodeURIComponent(value),
        ];
      },
    ),
    R.split('&'),
    R.when(
      R.startsWith('?'),
      (str) => str.substr(1),
    ),
  ),
);

export const pickURLParameters = R.compose(
  R.ifElse(
    R.isEmpty,
    R.always({}),
    R.compose(
      decodeUrlParams,
      R.nth(1),
    ),
  ),
  R.match(/\?(.*)$/),
);

export const encodePair = (key: EncodeValue, value: EncodeValue) => (
  `${encodeURIComponent(key)}=${encodeURIComponent(value ?? '')}`
);

export const encodeURLParams = R.compose(
  R.join('&'),
  R.reject(R.isEmpty),
  R.map(
    R.ifElse(
      // if value is empty, return blank
      R.pipe(
        R.nth(1),
        R.complement(R.isNil),
      ),
      ([key, value]) => {
        if (R.is(Array, value)) {
          return (
            R
              .map(
                (nestedItem) => `${key}[]=${encodeURIComponent(nestedItem)}`,
                value,
              )
              .join('&')
          );
        }

        // prevents empty phrase= in AsyncPaginatedTable
        if (R.isEmpty(value))
          return '';

        return encodePair(key, value);
      },
      R.always(''),
    ),
  ),
  R.toPairs,
);

export const buildURL = (url: string, params = {}) => {
  if (!params || R.isEmpty(params))
    return url;

  const encoded = encodeURLParams(params);
  if (!encoded.length)
    return url;

  return `${url}?${encoded}`;
};
