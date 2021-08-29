import {shallowCompareArrays} from './shallowCompareArrays';

type Invalidable<T> = T & {
  clearCache(): void;
};

/**
 * Caches function, call it only when arg change.
 * Instead R.memoizeWith it doesnt generate any keys,
 * just check if previous args are equal to current.
 * Its much lighter than reselect
 *
 * Function params have to be serializable!
 *
 * @export
 * @template A
 * @template T
 * @param {(prev: A, current: A) => boolean} cacheFn
 * @returns
 */
export function cacheOneCall<A extends [any] | any[]>(cacheFn: (prev?: A, current?: A) => boolean) {
  return <T> (fn: (...args: A) => T) => {
    let previousArgs: A = null;
    let previousReturn: T = null;

    const wrapped: Invalidable<(...args: A) => T> = function memoize(...args: A): T {
      if (previousArgs !== null && !cacheFn(previousArgs, args))
        return previousReturn;

      previousReturn = fn(...args);
      previousArgs = args;
      return previousReturn;
    };

    wrapped.clearCache = () => {
      previousArgs = null;
      previousReturn = null;
    };

    return wrapped;
  };
}

/**
 * Cache using default function
 *
 * @export
 * @template A
 * @template T
 * @param {(...args: A) => T} fn
 * @returns
 */
export function shallowMemoizeOneCall<A extends [any] | any[], T>(fn: (...args: A) => T) {
  return cacheOneCall<A>((a, b) => !shallowCompareArrays(a, b))(fn);
}
