import {
  useState,
  useRef,
  DependencyList,
} from 'react';

import {Size} from '@shared/types';
import {getElementSize} from '../helpers/html';
import {useIsomorphicLayoutEffect} from './useIsomorphicLayoutEffect';

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
  const handleResizeRef = useRef<() => void>();

  handleResizeRef.current = () => {
    const newSize = getElementSize(<T> elementRef.current, true, true);

    if (!size || newSize.w !== size.w || newSize.h !== size.h)
      setSize(newSize);
  };

  useIsomorphicLayoutEffect(
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
    size,
  };
}
