import {useRef, useState, useEffect} from 'react';

export const useTimeout = <S = void>(fn: () => S, delay: number, initialValue: S = null, keys: any[] = []) => {
  const [returnValue, setReturnValue] = useState<S>(initialValue);
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

      const id = setTimeout(
        (...args) => {
          const {current} = callbackRef;
          setReturnValue(
            current?.(...args), // eslint-disable-line no-unused-expressions
          );
        },
        delay,
      );

      return () => clearTimeout(id);
    },
    [delay, ...keys],
  );

  return returnValue;
};
