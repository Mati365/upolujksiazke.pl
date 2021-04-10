import {useRef} from 'react';

export function useSafeCallback<A extends [any] | any[], T>(fn: (...args: A) => T) {
  const ref = useRef<typeof fn>();
  ref.current = fn;

  return (...args: A): T => ref.current(...args);
}
