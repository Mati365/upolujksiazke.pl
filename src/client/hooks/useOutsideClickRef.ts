import {useRef, useEffect, Ref} from 'react';
import * as R from 'ramda';

import {suppressEvent} from '@shared/helpers';

export const useOutsideClickRef = (callback: VoidFunction): Ref<Element> => {
  const nodeRef = useRef<HTMLElement>();
  const callbackRef = useRef<typeof callback>();
  callbackRef.current = callback || R.T;

  useEffect(
    () => {
      const handleClick = (e: MouseEvent) => {
        const {current: node} = nodeRef;

        if (!node)
          return;

        if (!node.contains(<HTMLElement> e.target)) {
          callbackRef.current();
          suppressEvent(e);
        }
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
