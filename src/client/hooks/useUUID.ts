import {useMemo} from 'react';

export const useUUID = (() => {
  let counter = 0;

  return (): number => {
    const uuid = useMemo(
      () => counter++,
      [],
    );
    return uuid;
  };
})();
