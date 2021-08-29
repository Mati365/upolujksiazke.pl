import {
  useEffect,
  useState,
} from 'react';

import {Size} from '@shared/types';
import {isSSR} from '@shared/helpers/isSSR';

export function getWindowSize(): Size {
  if (isSSR) {
    return {
      w: null,
      h: null,
    };
  }

  return {
    w: window?.innerWidth,
    h: window?.innerHeight,
  };
}

/**
 * Read current window size, watches resize
 *
 * @export
 * @returns {Size}
 */
export function useWindowSize(): Size {
  const [size, setSize] = useState(
    getWindowSize(),
  );

  useEffect(
    () => {
      const updateSize = () => !isSSR && setSize(
        getWindowSize(),
      );

      window.addEventListener('resize', updateSize);
      window.addEventListener('orientationchange', updateSize);
      window.addEventListener('fullscreenchange', updateSize);

      return () => {
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('orientationchange', updateSize);
        window.removeEventListener('fullscreenchange', updateSize);
      };
    },
    [],
  );

  return size;
}
