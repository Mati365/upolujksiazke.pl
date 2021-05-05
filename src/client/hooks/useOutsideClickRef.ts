import {useRef, useEffect, Ref} from 'react';
import * as R from 'ramda';

export const useOutsideClickRef = <T extends HTMLElement = HTMLElement>(callback: VoidFunction): Ref<T> => {
  const nodeRef = useRef<T>();
  const callbackRef = useRef<typeof callback>();
  callbackRef.current = callback || R.T;

  useEffect(
    () => {
      const handleClick = (e: MouseEvent) => {
        const {current: node} = nodeRef;

        if (!node)
          return;

        if (!node.contains(<HTMLElement> e.target))
          callbackRef.current();
      };

      document.body.addEventListener('click', handleClick);
      return () => {
        document.body.removeEventListener('click', handleClick);
      };
    },
    [],
  );

  return nodeRef;
};
