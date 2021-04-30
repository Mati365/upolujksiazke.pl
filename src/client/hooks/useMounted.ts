import {useState, useEffect, useRef} from 'react';

export const useMounted = () => {
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(
    () => {
      setMounted(true);
    },
    [],
  );

  return mounted;
};

export const useMountedIndicatorRef = () => {
  const mountedRef = useRef<boolean>(null);

  useEffect(
    () => {
      mountedRef.current = true;

      return () => {
        mountedRef.current = false;
      };
    },
    [],
  );

  return mountedRef;
};
