import {useRef, useEffect} from 'react';

export const useInterval = (fn: (...args: any[]) => void, delay: number) => {
  const callbackRef = useRef(null);

  useEffect(
    () => {
      callbackRef.current = fn;
    },
    [fn],
  );

  useEffect(
    () => {
      if (delay === null)
        return undefined;

      const id = setInterval(
        (...args) => {
          const {current} = callbackRef;
          if (current)
            current(...args);
        },
        delay,
      );

      return () => clearInterval(id);
    },
    [delay],
  );
};
