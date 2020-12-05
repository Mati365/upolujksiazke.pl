import {
  useRef,
  useEffect,
} from 'react';

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
  useEffect(
    () => {
      ref.current = value;
    },
  );

  return ref.current;
}
