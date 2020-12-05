import {useRef} from 'react';

import {
  debounce,
  DebounceConfig,
  DebounceCallback,
} from '@shared/helpers/debounce';

export const useDebounce = (
  config: DebounceConfig&{disabled?: boolean},
  fn: DebounceCallback,
): (...args: any[]) => Promise<any> => {
  const callbackRef = useRef<DebounceCallback>();
  const debounceRef = useRef<DebounceCallback>();

  if (config.disabled || !config.delay)
    return fn;

  callbackRef.current = fn;
  if (!debounceRef.current) {
    debounceRef.current = debounce(config, (...args) => callbackRef.current?.(...args));
  }

  return debounceRef.current;
};
