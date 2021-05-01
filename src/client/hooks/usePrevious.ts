import {useRef} from 'react';

/**
 * Provided value from previous render
 *
 * @export
 * @template T
 * @param {T} value
 * @returns {T}
 */
export function usePrevious<T>(value: T): T {
  const ref = useRef<T>(null);
  const prevKey = ref.current;

  ref.current = value;

  return prevKey;
}
