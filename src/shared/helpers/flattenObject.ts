import * as R from 'ramda';

type FlattenParserConfig = {
  prefix?: string,
  joinArraySeparator?: string,
  prefixBuilderFn?(prefix: string, key: any): string,
};

/**
 * Builds flatten key name
 *
 * @param {string} prefix
 * @param {*} key
 * @returns
 */
function defaultPrefixBuilder(prefix: string, key: any) {
  return `${prefix}.${key}`;
}

/**
 * Transforms object with nested props to flatten
 *
 * @example
 *  {a: {b: 2}} => {'a.b': 2}
 *
 * @export
 * @param {*} object
 * @param {FlattenParserConfig} config
 */
export function flattenObject(
  object: any,
  {
    prefix = '',
    joinArraySeparator,
    prefixBuilderFn = defaultPrefixBuilder,
  }: FlattenParserConfig = {},
) {
  if (!object)
    return null;

  const result = {};
  for (const key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key))
      continue;

    const value = object[key];
    const keyPrefix = (
      prefix
        ? prefixBuilderFn(prefix, key)
        : key
    );

    if (R.is(Array, value)) {
      if (joinArraySeparator)
        result[keyPrefix] = value.join(joinArraySeparator);
      else {
        Object.assign(
          result,
          flattenObject(
            R.fromPairs(value.map((item: any, index: number) => [index, item])),
            {
              prefix: keyPrefix,
              joinArraySeparator,
              prefixBuilderFn,
            },
          ),
        );
      }
    } else if (R.is(Object, value)) {
      Object.assign(
        result,
        flattenObject(
          value,
          {
            prefix: keyPrefix,
            joinArraySeparator,
            prefixBuilderFn,
          },
        ),
      );
    } else
      result[keyPrefix] = value;
  }

  return result;
}

/**
 * Reverses flattenObject result
 *
 * @export
 * @param {*} object
 */
export function unflattenObject(object: any) {
  if (!object)
    return null;

  const result = {};
  for (const key in object) {
    if (!Object.prototype.hasOwnProperty.call(object, key))
      continue;

    const value = object[key];
    const path = key.split('.');

    path.reduce(
      (acc, pathKey, index) => {
        if (!acc[pathKey])
          acc[pathKey] = {};

        if (index === path.length - 1)
          acc[pathKey] = value;

        return acc[pathKey];
      },
      result,
    );
  }

  return result;
}
