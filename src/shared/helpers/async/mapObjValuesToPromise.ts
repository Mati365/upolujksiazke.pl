import * as R from 'ramda';
import {AwaitedObject} from '@shared/types';

type PromiseMapperFn<R = any> = (val: any, key: string) => Promise<R>;

const valuesToPromisesList = (mapperFn: PromiseMapperFn) => R.compose(
  R.map(
    ([key, val]: [string, any]) => {
      let promise = mapperFn(val, key);
      if (!R.is(Promise, promise))
        promise = Promise.resolve(val || null);

      return promise.then((result) => ([key, result]));
    },
  ),
  R.toPairs,
);

const nonNullPairsToObj = R.compose(
  R.fromPairs,
  R.reject(
    (array) => R.isNil(array[1]),
  ) as any, // remove nil values
);

/**
 * @param {Function}  mapperFn  Function that maps obj value to promise
 * @param {Object}    obj
 *
 * @example
 * {
 *  a: 'a',
 *  b: 'b',
 * }
 * transforms to:
 * {
 *  a: Promise() // with a
 *  b: Promise() // with b
 * }
 * and when object is returned when all promises are done
 */
export function mapObjValuesToPromise<R>(
  mapperFn: PromiseMapperFn<R>,
  obj: any,
): Promise<Record<string, R>> {
  const promises = valuesToPromisesList(mapperFn)(obj);

  return (
    Promise
      .all(promises)
      .then(nonNullPairsToObj) as any
  );
}

/**
 * Picks already mapped object and returns awaited result
 *
 * @export
 * @template R
 * @param {*} obj
 * @returns {Promise<Record<string, R>>}
 */
export function objPropsToPromise<T>(obj: T): Promise<AwaitedObject<T>> {
  return mapObjValuesToPromise(R.identity, obj) as any;
}
