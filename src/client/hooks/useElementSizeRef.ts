import {
  useState,
  useRef,
  DependencyList,
  useEffect,
} from 'react';

import {Size} from '@shared/types';
import {getElementSize} from '../helpers/getElementSize';

/**
 * Gets element size
 *
 * @export
 * @template T Ref element type
 * @param {DependencyList} [keys]
 * @returns
 */
export function useElementSizeRef<T extends HTMLElement>(keys: DependencyList = []) {
  const [size, setSize] = useState<Size>(null);
  const elementRef = useRef<T>(null);
  const handleResizeRef = useRef<(silent?: boolean) => void>();

  handleResizeRef.current = (silent?: boolean) => {
    const newSize = getElementSize(<T> elementRef.current, true);

    if (silent)
      Object.assign(size, newSize);
    else if (!size || newSize.w !== size.w || newSize.h !== size.h)
      setSize(newSize);
  };

  useEffect(
    () => {
      if (!elementRef.current)
        return undefined;

      const updateSize = () => handleResizeRef.current();
      const fullscreenUpdateSize = () => {
        const {current: node} = elementRef;
        if (!node)
          return;

        // h4ck, google chrome is not providing current size after fullscreen
        node.style.opacity = '0';
        setTimeout(
          () => {
            updateSize();
            node.style.opacity = '1';
          },
          600,
        );
      };

      updateSize();

      window.addEventListener('resize', updateSize);
      window.addEventListener('orientationchange', updateSize);
      window.addEventListener('fullscreenchange', fullscreenUpdateSize);

      return () => {
        window.removeEventListener('resize', updateSize);
        window.removeEventListener('orientationchange', updateSize);
        window.removeEventListener('fullscreenchange', fullscreenUpdateSize);
      };
    },
    [elementRef.current, ...keys],
  );

  return {
    ref: elementRef,
    triggerResize: handleResizeRef.current,
    size,
    setSize,
  };
}
