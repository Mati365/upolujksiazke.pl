import {useRef} from 'react';
import {randomString} from '@shared/helpers/randomString';

/**
 * Creates ID with using string
 *
 * @see
 *  Never use as id etc in SSR mode!
 *
 * @export
 * @returns {string}
 */
export function useID(): string {
  const ref = useRef<string>();
  if (!ref.current)
    ref.current = randomString();

  return ref.current;
}
